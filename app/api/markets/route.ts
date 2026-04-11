import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase
      .from('markets')
      .select(
        'id,slug,question,category,status,close_time,fee_bps,b_liquidity,market_state(yes_price,no_price,volume_total,participants_count,last_trade_at)'
      )
      .order('close_time', { ascending: true })
      .limit(25);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const markets = (data ?? []).map((market: any) => {
      const state = Array.isArray(market.market_state) ? market.market_state[0] : market.market_state;

      return {
        id: market.id,
        slug: market.slug,
        question: market.question,
        category: market.category,
        status: market.status,
        close_time: market.close_time,
        fee_bps: market.fee_bps,
        b_liquidity: market.b_liquidity,
        state: state
          ? {
              yes_price: Number(state.yes_price),
              no_price: Number(state.no_price),
              volume_total: Number(state.volume_total),
              participants_count: Number(state.participants_count),
              last_trade_at: state.last_trade_at
            }
          : null
      };
    });

    return NextResponse.json({ markets }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Markets API unavailable. Check Supabase env wiring.',
        detail: error instanceof Error ? error.message : 'unknown'
      },
      { status: 500 }
    );
  }
}
