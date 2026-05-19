import { NextResponse } from 'next/server';
import { localizedQuestionFromSlug } from '@/lib/market-copy';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { resolveServerLang } from '@/lib/ui-lang-server';

function round2(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
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

    const limitParam = Number(url.searchParams.get('limit') ?? '50');
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(Math.floor(limitParam), 1), 200) : 50;

    const { data: trades, error: tradesError } = await supabase
      .from('trades')
      .select('id,market_id,side,action,share_delta,avg_price,gross_amount,fee_amount,net_amount,created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (tradesError) {
      return NextResponse.json({ error: tradesError.message }, { status: 500 });
    }

    const tradeRows = (trades ?? []) as any[];
    const marketIds = [...new Set(tradeRows.map((t) => t.market_id).filter(Boolean))];

    const [marketResult, resolutionsResult, settlementEntriesResult] = await Promise.all([
      marketIds.length
        ? supabase.from('markets').select('id,slug,question,category,status').in('id', marketIds)
        : Promise.resolve({ data: [] as any[], error: null as any }),
      marketIds.length
        ? supabase.from('resolutions').select('market_id,outcome,created_at').in('market_id', marketIds)
        : Promise.resolve({ data: [] as any[], error: null as any }),
      marketIds.length
        ? supabase
            .from('market_settlement_entries')
            .select('market_id,created_at,realized_delta,payout_amount,refund_amount')
            .eq('user_id', user.id)
            .in('market_id', marketIds)
        : Promise.resolve({ data: [] as any[], error: null as any })
    ]);

    if (marketResult.error) {
      return NextResponse.json({ error: marketResult.error.message }, { status: 500 });
    }

    if (resolutionsResult.error) {
      return NextResponse.json({ error: resolutionsResult.error.message }, { status: 500 });
    }

    if (settlementEntriesResult.error) {
      return NextResponse.json({ error: settlementEntriesResult.error.message }, { status: 500 });
    }

    const marketMap = new Map((marketResult.data ?? []).map((m: any) => [m.id, m]));
    const resolutionMap = new Map((resolutionsResult.data ?? []).map((row: any) => [row.market_id, row]));
    const settlementEntryMap = new Map((settlementEntriesResult.data ?? []).map((row: any) => [row.market_id, row]));

    return NextResponse.json(
      {
        userId: user.id,
        count: tradeRows.length,
        trades: tradeRows.map((trade) => {
          const market = marketMap.get(trade.market_id) ?? null;
          const resolution = resolutionMap.get(trade.market_id) ?? null;
          const settlementEntry = settlementEntryMap.get(trade.market_id) ?? null;

          return {
            id: trade.id,
            marketId: trade.market_id,
            market: market
              ? {
                  slug: market.slug,
                  question: localizedQuestionFromSlug(market.slug, market.question, lang),
                  category: market.category,
                  status: market.status
                }
              : null,
            side: trade.side,
            action: trade.action,
            shareDelta: Number(trade.share_delta),
            avgPrice: Number(trade.avg_price),
            grossAmount: Number(trade.gross_amount),
            feeAmount: Number(trade.fee_amount),
            netAmount: Number(trade.net_amount),
            createdAt: trade.created_at,
            resolution: resolution
              ? {
                  outcome: resolution.outcome,
                  createdAt: resolution.created_at
                }
              : null,
            settlement: settlementEntry
              ? {
                  createdAt: settlementEntry.created_at,
                  realizedDelta: round2(Number(settlementEntry.realized_delta ?? 0)),
                  payoutAmount: round2(Number(settlementEntry.payout_amount ?? 0)),
                  refundAmount: round2(Number(settlementEntry.refund_amount ?? 0))
                }
              : null
          };
        })
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'trade history unavailable',
        detail: error instanceof Error ? error.message : 'unknown'
      },
      { status: 500 }
    );
  }
}

