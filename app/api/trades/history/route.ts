import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'auth required' }, { status: 401 });
    }

    const url = new URL(request.url);
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

    const marketResult = marketIds.length
      ? await supabase.from('markets').select('id,slug,question,category').in('id', marketIds)
      : { data: [] as any[], error: null as any };

    if (marketResult.error) {
      return NextResponse.json({ error: marketResult.error.message }, { status: 500 });
    }

    const marketMap = new Map((marketResult.data ?? []).map((m: any) => [m.id, m]));

    return NextResponse.json(
      {
        userId: user.id,
        count: tradeRows.length,
        trades: tradeRows.map((trade) => {
          const market = marketMap.get(trade.market_id) ?? null;

          return {
            id: trade.id,
            marketId: trade.market_id,
            market: market
              ? {
                  slug: market.slug,
                  question: market.question,
                  category: market.category
                }
              : null,
            side: trade.side,
            action: trade.action,
            shareDelta: Number(trade.share_delta),
            avgPrice: Number(trade.avg_price),
            grossAmount: Number(trade.gross_amount),
            feeAmount: Number(trade.fee_amount),
            netAmount: Number(trade.net_amount),
            createdAt: trade.created_at
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

