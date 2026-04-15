import { getSupabaseServerClient } from '@/lib/supabase/server';

function round2(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export async function loadHeaderSummary() {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { authenticated: false, cash: null as number | null, portfolio: null as number | null };
    }

    const [{ data: wallet }, { data: positions }] = await Promise.all([
      supabase
        .from('wallet_accounts')
        .select('available_balance')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle(),
      supabase
        .from('positions')
        .select('market_id,yes_shares,no_shares,yes_cost_basis,no_cost_basis')
        .eq('user_id', user.id)
    ]);

    const rows = ((positions ?? []) as any[]).filter((position) => {
      const yesShares = Number(position.yes_shares ?? 0);
      const noShares = Number(position.no_shares ?? 0);
      const yesCostBasis = Number(position.yes_cost_basis ?? 0);
      const noCostBasis = Number(position.no_cost_basis ?? 0);

      return yesShares > 0 || noShares > 0 || yesCostBasis > 0 || noCostBasis > 0;
    });

    const marketIds = [...new Set(rows.map((row) => row.market_id).filter(Boolean))];

    const statesResult = marketIds.length
      ? await supabase.from('market_state').select('market_id,yes_price,no_price').in('market_id', marketIds)
      : { data: [] as any[] };

    const stateMap = new Map(((statesResult.data ?? []) as any[]).map((state) => [state.market_id, state]));

    let marketValueTotal = 0;

    rows.forEach((position) => {
      const yesShares = Number(position.yes_shares ?? 0);
      const noShares = Number(position.no_shares ?? 0);
      const state = stateMap.get(position.market_id);
      const yesPrice = Number(state?.yes_price ?? 0);
      const noPrice = Number(state?.no_price ?? 0);

      marketValueTotal += yesShares * yesPrice + noShares * noPrice;
    });

    return {
      authenticated: true,
      cash: round2(Number((wallet as any)?.available_balance ?? 0)),
      portfolio: round2(marketValueTotal)
    };
  } catch {
    return { authenticated: false, cash: null as number | null, portfolio: null as number | null };
  }
}
