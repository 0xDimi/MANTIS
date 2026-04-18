import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { getSupabaseServerClient } from '@/lib/supabase/server';

function round2(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
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

    const positionRows = ((positions ?? []) as any[]).filter((position) => {
      const yesShares = Number(position.yes_shares ?? 0);
      const noShares = Number(position.no_shares ?? 0);
      const yesCostBasis = Number(position.yes_cost_basis ?? 0);
      const noCostBasis = Number(position.no_cost_basis ?? 0);

      return yesShares > 0 || noShares > 0 || yesCostBasis > 0 || noCostBasis > 0;
    });
    const marketIds = [...new Set(positionRows.map((p) => p.market_id).filter(Boolean))];

    const [marketsResult, statesResult] = await Promise.all([
      marketIds.length
        ? supabase.from('markets').select('id,slug,question,status').in('id', marketIds)
        : Promise.resolve({ data: [] as any[], error: null as any }),
      marketIds.length
        ? supabase.from('market_state').select('market_id,yes_price,no_price').in('market_id', marketIds)
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

    const marketMap = new Map((marketsResult.data ?? []).map((m: any) => [m.id, m]));
    const stateMap = new Map((statesResult.data ?? []).map((s: any) => [s.market_id, s]));

    let marketValueTotal = 0;
    let costBasisTotal = 0;

    const enrichedPositions = positionRows.map((position) => {
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
              question: market.question,
              status: market.status
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
        positions: enrichedPositions
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

