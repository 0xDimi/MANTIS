import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { localizeMarketDetailCopy } from '@/lib/market-copy';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { resolveServerLang } from '@/lib/ui-lang-server';

function isMissingSettlementTableError(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes('market_settlements') && normalized.includes('does not exist');
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const url = new URL(request.url);
    const lang = await resolveServerLang({ searchParam: url.searchParams.get('lang') });
    const supabase = await getSupabaseServerClient();

    const { data: market, error: marketError } = await supabase
      .from('markets')
      .select(
        'id,slug,question,description,category,status,close_time,resolution_time,source_primary,source_fallback,void_rule,fee_bps,b_liquidity,yes_label,no_label'
      )
      .eq('slug', slug)
      .limit(1)
      .maybeSingle();

    if (marketError) {
      Sentry.captureException(new Error(marketError.message), {
        tags: { route: 'api/markets/[slug]' }
      });
      return NextResponse.json({ error: marketError.message }, { status: 500 });
    }

    if (!market) {
      return NextResponse.json({ error: 'market not found' }, { status: 404 });
    }

    const marketRow = market as any;

    const [{ data: state, error: stateError }, { data: resolution, error: resolutionError }, { data: settlement, error: settlementError }] =
      await Promise.all([
        supabase
          .from('market_state')
          .select('market_id,q_yes,q_no,yes_price,no_price,last_trade_at,volume_total,open_interest,participants_count')
          .eq('market_id', marketRow.id)
          .limit(1)
          .maybeSingle(),
        supabase
          .from('resolutions')
          .select('id,outcome,evidence_summary,evidence_url,created_at')
          .eq('market_id', marketRow.id)
          .limit(1)
          .maybeSingle(),
        supabase
          .from('market_settlements')
          .select('id,outcome,affected_accounts,total_payout,total_refund,total_realized_pnl,created_at')
          .eq('market_id', marketRow.id)
          .limit(1)
          .maybeSingle()
      ]);

    if (stateError) {
      Sentry.captureException(new Error(stateError.message), {
        tags: { route: 'api/markets/[slug]' }
      });
      return NextResponse.json({ error: stateError.message }, { status: 500 });
    }

    if (resolutionError) {
      Sentry.captureException(new Error(resolutionError.message), {
        tags: { route: 'api/markets/[slug]' }
      });
      return NextResponse.json({ error: resolutionError.message }, { status: 500 });
    }

    if (settlementError && !isMissingSettlementTableError(settlementError.message ?? '')) {
      Sentry.captureException(new Error(settlementError.message), {
        tags: { route: 'api/markets/[slug]' }
      });
      return NextResponse.json({ error: settlementError.message }, { status: 500 });
    }

    const stateRow = state as any;
    const localizedMarket = localizeMarketDetailCopy(
      {
        id: marketRow.id,
        slug: marketRow.slug,
        question: marketRow.question,
        description: marketRow.description,
        category: marketRow.category,
        status: marketRow.status,
        closeTime: marketRow.close_time,
        resolutionTime: marketRow.resolution_time,
        sourcePrimary: marketRow.source_primary,
        sourceFallback: marketRow.source_fallback,
        voidRule: marketRow.void_rule,
        yesLabel: marketRow.yes_label,
        noLabel: marketRow.no_label,
        liquidity: Number(marketRow.b_liquidity ?? 0),
        feeBps: Number(marketRow.fee_bps ?? 0),
        resolution: null,
        settlement: null
      },
      lang
    );

    return NextResponse.json(
      {
        market: {
          ...marketRow,
          question: localizedMarket.question,
          description: localizedMarket.description,
          source_primary: localizedMarket.sourcePrimary,
          source_fallback: localizedMarket.sourceFallback,
          void_rule: localizedMarket.voidRule,
          yes_label: localizedMarket.yesLabel,
          no_label: localizedMarket.noLabel
        },
        state: stateRow
          ? {
              market_id: stateRow.market_id,
              q_yes: Number(stateRow.q_yes),
              q_no: Number(stateRow.q_no),
              yes_price: Number(stateRow.yes_price),
              no_price: Number(stateRow.no_price),
              last_trade_at: stateRow.last_trade_at,
              volume_total: Number(stateRow.volume_total),
              open_interest: Number(stateRow.open_interest),
              participants_count: Number(stateRow.participants_count)
            }
          : null,
        resolution: resolution
          ? {
              id: (resolution as any).id,
              outcome: (resolution as any).outcome,
              evidence_summary: (resolution as any).evidence_summary,
              evidence_url: (resolution as any).evidence_url,
              created_at: (resolution as any).created_at
            }
          : null,
        settlement: settlementError && isMissingSettlementTableError(settlementError.message ?? '')
          ? null
          : settlement
          ? {
              id: (settlement as any).id,
              outcome: (settlement as any).outcome,
              affected_accounts: Number((settlement as any).affected_accounts ?? 0),
              total_payout: Number((settlement as any).total_payout ?? 0),
              total_refund: Number((settlement as any).total_refund ?? 0),
              total_realized_pnl: Number((settlement as any).total_realized_pnl ?? 0),
              created_at: (settlement as any).created_at
            }
          : null
      },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException(error, {
      tags: { route: 'api/markets/[slug]' }
    });

    return NextResponse.json(
      {
        error: 'market detail API unavailable',
        detail: error instanceof Error ? error.message : 'unknown'
      },
      { status: 500 }
    );
  }
}
