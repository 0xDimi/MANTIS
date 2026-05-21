import { unstable_noStore as noStore } from 'next/cache';
import { headers } from 'next/headers';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { UiLang } from '@/lib/ui-lang';

export type BoardMarket = {
  id: string;
  slug: string;
  question: string;
  category: string;
  status: string;
  feeBps: number;
  liquidity: number;
  closeTime: string;
  state: {
    yesPrice: number;
    noPrice: number;
    volumeTotal: number;
    participantsCount: number;
    lastTradeAt: string | null;
  } | null;
};

export type MarketDetailRead = {
  id: string;
  slug: string;
  question: string;
  description: string | null;
  category: string;
  status: string;
  closeTime: string;
  resolutionTime: string | null;
  sourcePrimary: string;
  sourceFallback: string | null;
  voidRule: string;
  yesLabel: string;
  noLabel: string;
  liquidity: number;
  feeBps: number;
  updatedAt: string;
  resolution: {
    id: string;
    outcome: 'yes' | 'no' | 'void';
    evidenceSummary: string;
    evidenceUrl: string | null;
    createdAt: string;
  } | null;
  settlement: {
    id: string;
    outcome: 'yes' | 'no' | 'void';
    affectedAccounts: number;
    totalPayout: number;
    totalRefund: number;
    totalRealizedPnl: number;
    createdAt: string;
  } | null;
};

export type MarketStateRead = {
  marketId: string;
  qYes: number;
  qNo: number;
  yesPrice: number;
  noPrice: number;
  lastTradeAt: string | null;
  volumeTotal: number;
  openInterest: number;
  participantsCount: number;
} | null;

type MarketsApiResponse = {
  markets: Array<{
    id: string;
    slug: string;
    question: string;
    category: string;
    status: string;
    close_time: string;
    fee_bps: number;
    b_liquidity: number;
    state: {
      yes_price: number;
      no_price: number;
      volume_total: number;
      participants_count: number;
      last_trade_at: string | null;
    } | null;
  }>;
};

type MarketDetailApiResponse = {
  market: {
    id: string;
    slug: string;
    question: string;
    description: string | null;
    category: string;
    status: string;
    close_time: string;
    resolution_time: string | null;
    source_primary: string;
    source_fallback: string | null;
    void_rule: string;
    yes_label: string;
    no_label: string;
    b_liquidity: number;
    fee_bps: number;
    updated_at: string;
  } | null;
  state: {
    market_id: string;
    q_yes: number;
    q_no: number;
    yes_price: number;
    no_price: number;
    last_trade_at: string | null;
    volume_total: number;
    open_interest: number;
    participants_count: number;
  } | null;
  resolution: {
    id: string;
    outcome: 'yes' | 'no' | 'void';
    evidence_summary: string;
    evidence_url: string | null;
    created_at: string;
  } | null;
  settlement: {
    id: string;
    outcome: 'yes' | 'no' | 'void';
    affected_accounts: number;
    total_payout: number;
    total_refund: number;
    total_realized_pnl: number;
    created_at: string;
  } | null;
};

async function getRequestBaseUrl() {
  const headerStore = await headers();
  const host = headerStore.get('x-forwarded-host') ?? headerStore.get('host');

  if (!host) {
    throw new Error('request host unavailable for internal API read');
  }

  const protocol =
    headerStore.get('x-forwarded-proto') ?? (host.includes('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');

  return `${protocol}://${host}`;
}

async function readJson<T>(path: string) {
  noStore();

  const baseUrl = await getRequestBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    cache: 'no-store'
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage =
      payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : `request failed (${response.status})`;

    throw new Error(errorMessage);
  }

  return payload as T;
}

export async function loadMarketsBoard(options?: { scope?: 'open' | 'all'; lang?: UiLang }) {
  try {
    const scope = options?.scope === 'all' ? 'all' : 'open';
    const params = new URLSearchParams({ scope });
    if (options?.lang === 'el') params.set('lang', 'el');
    const payload = await readJson<MarketsApiResponse>(`/api/markets?${params.toString()}`);

    const markets: BoardMarket[] = (payload.markets ?? []).map((market) => ({
      id: market.id,
      slug: market.slug,
      question: market.question,
      category: market.category,
      status: market.status,
      feeBps: Number(market.fee_bps ?? 0),
      liquidity: Number(market.b_liquidity ?? 0),
      closeTime: market.close_time,
      state: market.state
        ? {
            yesPrice: Number(market.state.yes_price ?? 0),
            noPrice: Number(market.state.no_price ?? 0),
            volumeTotal: Number(market.state.volume_total ?? 0),
            participantsCount: Number(market.state.participants_count ?? 0),
            lastTradeAt: market.state.last_trade_at ?? null
          }
        : null
    }));

    return { markets, error: null };
  } catch (error) {
    return {
      markets: [] as BoardMarket[],
      error: error instanceof Error ? error.message : 'unknown error'
    };
  }
}

export async function loadMarketDetail(slug: string, options?: { lang?: UiLang }) {
  try {
    const params = new URLSearchParams();
    if (options?.lang === 'el') params.set('lang', 'el');
    const payload = await readJson<MarketDetailApiResponse>(`/api/markets/${slug}${params.size ? `?${params.toString()}` : ''}`);

    return {
      market: payload.market
        ? ({
            id: payload.market.id,
            slug: payload.market.slug,
            question: payload.market.question,
            description: payload.market.description,
            category: payload.market.category,
            status: payload.market.status,
            closeTime: payload.market.close_time,
            resolutionTime: payload.market.resolution_time,
            sourcePrimary: payload.market.source_primary,
            sourceFallback: payload.market.source_fallback,
            voidRule: payload.market.void_rule,
            yesLabel: payload.market.yes_label,
            noLabel: payload.market.no_label,
            liquidity: Number(payload.market.b_liquidity ?? 0),
            feeBps: Number(payload.market.fee_bps ?? 0),
            updatedAt: payload.market.updated_at,
            resolution: payload.resolution
              ? {
                  id: payload.resolution.id,
                  outcome: payload.resolution.outcome,
                  evidenceSummary: payload.resolution.evidence_summary,
                  evidenceUrl: payload.resolution.evidence_url,
                  createdAt: payload.resolution.created_at
                }
              : null,
            settlement: payload.settlement
              ? {
                  id: payload.settlement.id,
                  outcome: payload.settlement.outcome,
                  affectedAccounts: Number(payload.settlement.affected_accounts ?? 0),
                  totalPayout: Number(payload.settlement.total_payout ?? 0),
                  totalRefund: Number(payload.settlement.total_refund ?? 0),
                  totalRealizedPnl: Number(payload.settlement.total_realized_pnl ?? 0),
                  createdAt: payload.settlement.created_at
                }
              : null
          } satisfies MarketDetailRead)
        : null,
      state: payload.state
        ? ({
            marketId: payload.state.market_id,
            qYes: Number(payload.state.q_yes ?? 0),
            qNo: Number(payload.state.q_no ?? 0),
            yesPrice: Number(payload.state.yes_price ?? 0),
            noPrice: Number(payload.state.no_price ?? 0),
            lastTradeAt: payload.state.last_trade_at ?? null,
            volumeTotal: Number(payload.state.volume_total ?? 0),
            openInterest: Number(payload.state.open_interest ?? 0),
            participantsCount: Number(payload.state.participants_count ?? 0)
          } satisfies NonNullable<MarketStateRead>)
        : null,
      error: null
    };
  } catch (error) {
    return {
      market: null,
      state: null as MarketStateRead,
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
      supabase
        .from('positions')
        .select('id,yes_shares,no_shares,yes_cost_basis,no_cost_basis')
        .eq('user_id', user.id),
      supabase.from('trades').select('id').eq('user_id', user.id)
    ]);

    if (walletError) {
      return { auth: true, wallet: null, positionsCount: 0, tradesCount: 0, error: walletError.message };
    }

    const activePositions = ((positions ?? []) as any[]).filter((position) => {
      const yesShares = Number(position.yes_shares ?? 0);
      const noShares = Number(position.no_shares ?? 0);
      const yesCostBasis = Number(position.yes_cost_basis ?? 0);
      const noCostBasis = Number(position.no_cost_basis ?? 0);

      return yesShares > 0 || noShares > 0 || yesCostBasis > 0 || noCostBasis > 0;
    });

    return {
      auth: true,
      wallet: wallet as any,
      positionsCount: activePositions.length,
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
