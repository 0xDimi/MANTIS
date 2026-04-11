import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function loadMarketsBoard() {
  try {
    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase
      .from('markets')
      .select(
        'id,slug,question,category,status,b_liquidity,close_time,market_state(yes_price,no_price,volume_total,participants_count,last_trade_at)'
      )
      .order('close_time', { ascending: true })
      .limit(30);

    if (error) {
      return { markets: [], error: error.message };
    }

    const markets = ((data ?? []) as any[]).map((market) => {
      const state = Array.isArray(market.market_state) ? market.market_state[0] : market.market_state;

      return {
        id: market.id as string,
        slug: market.slug as string,
        question: market.question as string,
        category: market.category as string,
        status: market.status as string,
        depth: Number(market.b_liquidity ?? 0),
        closeTime: market.close_time as string,
        state: state
          ? {
              yesPrice: Number(state.yes_price ?? 0),
              noPrice: Number(state.no_price ?? 0),
              volumeTotal: Number(state.volume_total ?? 0),
              participantsCount: Number(state.participants_count ?? 0),
              lastTradeAt: state.last_trade_at as string | null
            }
          : null
      };
    });

    return { markets, error: null };
  } catch (error) {
    return {
      markets: [],
      error: error instanceof Error ? error.message : 'unknown error'
    };
  }
}

export async function loadMarketDetail(slug: string) {
  try {
    const supabase = await getSupabaseServerClient();

    const { data: market, error: marketError } = await supabase
      .from('markets')
      .select(
        'id,slug,question,description,category,status,close_time,resolution_time,source_primary,source_fallback,void_rule,yes_label,no_label,b_liquidity,fee_bps'
      )
      .eq('slug', slug)
      .limit(1)
      .maybeSingle();

    if (marketError) {
      return { market: null, state: null, error: marketError.message };
    }

    if (!market) {
      return { market: null, state: null, error: null };
    }

    const marketRow = market as any;

    const { data: state, error: stateError } = await supabase
      .from('market_state')
      .select('market_id,yes_price,no_price,volume_total,participants_count,last_trade_at')
      .eq('market_id', marketRow.id)
      .limit(1)
      .maybeSingle();

    if (stateError) {
      return { market: marketRow, state: null, error: stateError.message };
    }

    const stateRow = state as any;

    return {
      market: marketRow,
      state: stateRow
        ? {
            yesPrice: Number(stateRow.yes_price ?? 0),
            noPrice: Number(stateRow.no_price ?? 0),
            volumeTotal: Number(stateRow.volume_total ?? 0),
            participantsCount: Number(stateRow.participants_count ?? 0),
            lastTradeAt: stateRow.last_trade_at as string | null
          }
        : null,
      error: null
    };
  } catch (error) {
    return {
      market: null,
      state: null,
      error: error instanceof Error ? error.message : 'unknown error'
    };
  }
}

export async function loadPortfolioOverview() {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError) {
      return { auth: false, wallet: null, positionsCount: 0, tradesCount: 0, error: authError.message };
    }

    if (!user) {
      return { auth: false, wallet: null, positionsCount: 0, tradesCount: 0, error: null };
    }

    const [{ data: wallet, error: walletError }, { data: positions }, { data: trades }] = await Promise.all([
      supabase
        .from('wallet_accounts')
        .select('starting_balance,available_balance,realized_pnl,currency,updated_at')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle(),
      supabase.from('positions').select('id').eq('user_id', user.id),
      supabase.from('trades').select('id').eq('user_id', user.id)
    ]);

    if (walletError) {
      return { auth: true, wallet: null, positionsCount: 0, tradesCount: 0, error: walletError.message };
    }

    return {
      auth: true,
      wallet: wallet as any,
      positionsCount: (positions ?? []).length,
      tradesCount: (trades ?? []).length,
      error: null
    };
  } catch (error) {
    return {
      auth: false,
      wallet: null,
      positionsCount: 0,
      tradesCount: 0,
      error: error instanceof Error ? error.message : 'unknown error'
    };
  }
}

