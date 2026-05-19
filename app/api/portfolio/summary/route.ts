import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { localizedQuestionFromSlug } from '@/lib/market-copy';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { resolveServerLang } from '@/lib/ui-lang-server';

function round2(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function hasOpenExposure(position: any) {
  const yesShares = Number(position.yes_shares ?? 0);
  const noShares = Number(position.no_shares ?? 0);
  const yesCostBasis = Number(position.yes_cost_basis ?? 0);
  const noCostBasis = Number(position.no_cost_basis ?? 0);

  return yesShares > 0 || noShares > 0 || yesCostBasis > 0 || noCostBasis > 0;
}

function deriveHistoryResult({
  outcome,
  realizedPnl,
  yesSharesClosed,
  noSharesClosed
}: {
  outcome: string | null;
  realizedPnl: number;
  yesSharesClosed: number;
  noSharesClosed: number;
}) {
  if (outcome === 'void') return 'void';
  if (realizedPnl > 0.004) return 'won';
  if (realizedPnl < -0.004) return 'lost';
  if (outcome === 'yes' && yesSharesClosed > noSharesClosed) return 'won';
  if (outcome === 'no' && noSharesClosed > yesSharesClosed) return 'won';
  if (outcome === 'yes' && noSharesClosed > yesSharesClosed) return 'lost';
  if (outcome === 'no' && yesSharesClosed > noSharesClosed) return 'lost';
  return 'flat';
}

function derivePositionSide(yesSharesClosed: number, noSharesClosed: number) {
  if (yesSharesClosed > 0 && noSharesClosed > 0) return 'mixed' as const;
  if (yesSharesClosed > 0) return 'yes' as const;
  if (noSharesClosed > 0) return 'no' as const;
  return 'mixed' as const;
}

export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    const url = new URL(request.url);
    const lang = await resolveServerLang({ searchParam: url.searchParams.get('lang') });
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'auth required' }, { status: 401 });
    }

    Sentry.setUser({ id: user.id });

    const [{ data: wallet, error: walletError }, { data: positions, error: positionsError }] = await Promise.all([
      supabase
        .from('wallet_accounts')
        .select('currency,starting_balance,available_balance,realized_pnl,updated_at')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle(),
      supabase
        .from('positions')
        .select('market_id,yes_shares,no_shares,yes_cost_basis,no_cost_basis,realized_pnl,updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
    ]);

    if (walletError) {
      Sentry.captureException(new Error(walletError.message), {
        tags: { route: 'api/portfolio/summary' }
      });
      return NextResponse.json({ error: walletError.message }, { status: 500 });
    }

    if (positionsError) {
      Sentry.captureException(new Error(positionsError.message), {
        tags: { route: 'api/portfolio/summary' }
      });
      return NextResponse.json({ error: positionsError.message }, { status: 500 });
    }

    const allPositionRows = (positions ?? []) as any[];
    const marketIds = [...new Set(allPositionRows.map((position) => position.market_id).filter(Boolean))];

    const [marketsResult, statesResult, resolutionsResult, settlementEntriesResult] = await Promise.all([
      marketIds.length
        ? supabase.from('markets').select('id,slug,question,category,status').in('id', marketIds)
        : Promise.resolve({ data: [] as any[], error: null as any }),
      marketIds.length
        ? supabase.from('market_state').select('market_id,yes_price,no_price').in('market_id', marketIds)
        : Promise.resolve({ data: [] as any[], error: null as any }),
      marketIds.length
        ? supabase.from('resolutions').select('market_id,outcome,created_at').in('market_id', marketIds)
        : Promise.resolve({ data: [] as any[], error: null as any }),
      marketIds.length
        ? supabase
            .from('market_settlement_entries')
            .select('market_id,created_at,payout_amount,refund_amount,realized_delta,yes_shares_closed,no_shares_closed')
            .eq('user_id', user.id)
            .in('market_id', marketIds)
        : Promise.resolve({ data: [] as any[], error: null as any })
    ]);

    if (marketsResult.error) {
      Sentry.captureException(new Error(marketsResult.error.message), {
        tags: { route: 'api/portfolio/summary' }
      });
      return NextResponse.json({ error: marketsResult.error.message }, { status: 500 });
    }

    if (statesResult.error) {
      Sentry.captureException(new Error(statesResult.error.message), {
        tags: { route: 'api/portfolio/summary' }
      });
      return NextResponse.json({ error: statesResult.error.message }, { status: 500 });
    }

    if (resolutionsResult.error) {
      Sentry.captureException(new Error(resolutionsResult.error.message), {
        tags: { route: 'api/portfolio/summary' }
      });
      return NextResponse.json({ error: resolutionsResult.error.message }, { status: 500 });
    }

    if (settlementEntriesResult.error) {
      Sentry.captureException(new Error(settlementEntriesResult.error.message), {
        tags: { route: 'api/portfolio/summary' }
      });
      return NextResponse.json({ error: settlementEntriesResult.error.message }, { status: 500 });
    }

    const marketMap = new Map((marketsResult.data ?? []).map((market: any) => [market.id, market]));
    const stateMap = new Map((statesResult.data ?? []).map((state: any) => [state.market_id, state]));
    const resolutionMap = new Map((resolutionsResult.data ?? []).map((resolution: any) => [resolution.market_id, resolution]));
    const settlementEntryMap = new Map((settlementEntriesResult.data ?? []).map((entry: any) => [entry.market_id, entry]));

    let marketValueTotal = 0;
    let costBasisTotal = 0;

    const enrichedPositions = allPositionRows
      .filter((position) => hasOpenExposure(position))
      .map((position) => {
        const yesShares = Number(position.yes_shares ?? 0);
        const noShares = Number(position.no_shares ?? 0);
        const yesCostBasis = Number(position.yes_cost_basis ?? 0);
        const noCostBasis = Number(position.no_cost_basis ?? 0);
        const costBasis = yesCostBasis + noCostBasis;

        const market = marketMap.get(position.market_id) ?? null;
        const state = stateMap.get(position.market_id) ?? null;

        const yesPrice = state ? Number(state.yes_price ?? 0) : 0;
        const noPrice = state ? Number(state.no_price ?? 0) : 0;

        const yesValue = yesShares * yesPrice;
        const noValue = noShares * noPrice;
        const marketValue = yesValue + noValue;
        const unrealizedPnl = marketValue - costBasis;

        marketValueTotal += marketValue;
        costBasisTotal += costBasis;

        return {
          marketId: position.market_id,
          market: market
            ? {
                slug: market.slug,
                question: localizedQuestionFromSlug(market.slug, market.question, lang),
                status: market.status,
                category: market.category
              }
            : null,
          pricing: state
            ? {
                yesPrice,
                noPrice
              }
            : null,
          position: {
            yesShares,
            noShares,
            yesCostBasis: round2(yesCostBasis),
            noCostBasis: round2(noCostBasis),
            realizedPnl: round2(Number(position.realized_pnl ?? 0)),
            unrealizedPnl: round2(unrealizedPnl),
            marketValue: round2(marketValue)
          },
          updatedAt: position.updated_at
        };
      });

    const history = allPositionRows
      .map((position) => {
        const market = marketMap.get(position.market_id) ?? null;
        const resolution = resolutionMap.get(position.market_id) ?? null;
        const settlementEntry = settlementEntryMap.get(position.market_id) ?? null;

        if (!market) return null;
        if (!['settled', 'resolved', 'void'].includes(market.status) && !resolution && !settlementEntry) return null;

        const realizedPnl = round2(Number(position.realized_pnl ?? 0));
        const yesSharesClosed = Number(settlementEntry?.yes_shares_closed ?? 0);
        const noSharesClosed = Number(settlementEntry?.no_shares_closed ?? 0);
        const outcome = (resolution?.outcome ?? null) as string | null;
        const settledAt = settlementEntry?.created_at ?? resolution?.created_at ?? position.updated_at;

        return {
          marketId: position.market_id,
          market: {
            slug: market.slug,
            question: localizedQuestionFromSlug(market.slug, market.question, lang),
            category: market.category,
            status: market.status
          },
          positionSide: derivePositionSide(yesSharesClosed, noSharesClosed),
          resolutionOutcome: outcome,
          result: deriveHistoryResult({
            outcome,
            realizedPnl,
            yesSharesClosed,
            noSharesClosed
          }),
          realizedPnl,
          settledAt,
          yesSharesClosed: round2(yesSharesClosed),
          noSharesClosed: round2(noSharesClosed),
          payoutAmount: round2(Number(settlementEntry?.payout_amount ?? 0)),
          refundAmount: round2(Number(settlementEntry?.refund_amount ?? 0))
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => new Date(b.settledAt).getTime() - new Date(a.settledAt).getTime());

    const walletRow = wallet as any;

    return NextResponse.json(
      {
        userId: user.id,
        wallet: walletRow
          ? {
              currency: walletRow.currency,
              startingBalance: round2(Number(walletRow.starting_balance ?? 0)),
              availableBalance: round2(Number(walletRow.available_balance ?? 0)),
              realizedPnl: round2(Number(walletRow.realized_pnl ?? 0)),
              updatedAt: walletRow.updated_at
            }
          : null,
        totals: {
          costBasis: round2(costBasisTotal),
          marketValue: round2(marketValueTotal),
          unrealizedPnl: round2(marketValueTotal - costBasisTotal)
        },
        positions: enrichedPositions,
        history
      },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException(error, {
      tags: { route: 'api/portfolio/summary' }
    });

    return NextResponse.json(
      {
        error: 'portfolio summary unavailable',
        detail: error instanceof Error ? error.message : 'unknown'
      },
      { status: 500 }
    );
  }
}
