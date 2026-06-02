import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { localizeBoardMarketCopy } from '@/lib/market-copy';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { resolveServerLang } from '@/lib/ui-lang-server';

export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    const url = new URL(request.url);
    const scope = url.searchParams.get('scope') === 'all' ? 'all' : 'open';
    const lang = await resolveServerLang({ searchParam: url.searchParams.get('lang') });

    let query = supabase
      .from('markets')
      .select(
        'id,slug,question,category,status,close_time,fee_bps,b_liquidity,updated_at,is_event_child,market_state(yes_price,no_price,volume_total,participants_count,last_trade_at)'
      )
      .eq('is_event_child', false)
      .limit(40);

    if (scope === 'open') {
      query = query.eq('status', 'open').order('close_time', { ascending: true });
    } else {
      query = query.order('updated_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      Sentry.captureException(new Error(error.message), {
        tags: { route: 'api/markets' }
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const markets = (data ?? []).map((market: any) => {
      const state = Array.isArray(market.market_state) ? market.market_state[0] : market.market_state;

      const localized = localizeBoardMarketCopy(
        {
          id: market.id,
          slug: market.slug,
          question: market.question,
          category: market.category,
          status: market.status,
          feeBps: Number(market.fee_bps ?? 0),
          liquidity: Number(market.b_liquidity ?? 0),
          closeTime: market.close_time,
          state: null
        },
        lang
      );

      return {
        id: market.id,
        slug: market.slug,
        question: localized.question,
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
    Sentry.captureException(error, {
      tags: { route: 'api/markets' }
    });

    return NextResponse.json(
      {
        error: 'Markets API unavailable. Check Supabase env wiring.',
        detail: error instanceof Error ? error.message : 'unknown'
      },
      { status: 500 }
    );
  }
}
