import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { buildAmmV0Quote } from '@/lib/amm-v0';
import { getAthensDayStartIso, getAthensNowParts, isOpsAuthorized, parseBoolean } from '@/lib/ops-automation';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

type MarketRow = {
  id: string;
  slug: string;
  close_time: string;
  status: string;
  b_liquidity: number;
  fee_bps: number;
  market_state:
    | {
        q_yes: number;
        q_no: number;
        yes_price: number;
        no_price: number;
        volume_total: number;
        last_trade_at: string | null;
      }
    | Array<{
        q_yes: number;
        q_no: number;
        yes_price: number;
        no_price: number;
        volume_total: number;
        last_trade_at: string | null;
      }>
    | null;
};

type TradeRow = {
  market_id: string;
  gross_amount: number;
  created_at: string;
};

type OrderExecutionResult = {
  marketId: string;
  marketSlug: string;
  side: 'yes' | 'no';
  grossAmount: number;
  shareDelta: number;
  avgPrice: number;
  postYesPrice: number;
  createdAt: string;
  quoteHash: string;
};

const LIQUIDITY_RUNTIME_ID = 'house_liquidity_latest';

function normalizeState(input: MarketRow['market_state']) {
  if (Array.isArray(input)) return input[0] ?? null;
  return input ?? null;
}

function diffMinutes(now: Date, atIso: string | null | undefined) {
  if (!atIso) return Number.POSITIVE_INFINITY;
  const diff = now.getTime() - new Date(atIso).getTime();
  if (!Number.isFinite(diff)) return Number.POSITIVE_INFINITY;
  return diff / 60_000;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

async function ensureHouseWallet(userId: string) {
  const admin = getSupabaseAdminClient();
  const fallbackDisplayName = process.env.HOUSE_LIQUIDITY_DISPLAY_NAME?.trim() || 'MANTIS House Liquidity';
  const fallbackUsername = process.env.HOUSE_LIQUIDITY_USERNAME?.trim() || null;
  const startingBalance = Number(process.env.HOUSE_LIQUIDITY_STARTING_BALANCE_EUR ?? '50000');

  await (admin as any).from('profiles').upsert(
    {
      user_id: userId,
      display_name: fallbackDisplayName,
      username: fallbackUsername,
      role: 'tester'
    },
    { onConflict: 'user_id' }
  );

  const { data: wallet } = await admin
    .from('wallet_accounts')
    .select('id,user_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (wallet) return;

  await (admin as any).from('wallet_accounts').insert({
    user_id: userId,
    currency: 'PAPER_EUR',
    starting_balance: startingBalance,
    available_balance: startingBalance,
    realized_pnl: 0
  });
}

async function loadMarketWithState(marketId: string) {
  const admin = getSupabaseAdminClient();

  const { data, error } = await admin
    .from('markets')
    .select('id,slug,close_time,status,b_liquidity,fee_bps,market_state(q_yes,q_no,yes_price,no_price,volume_total,last_trade_at)')
    .eq('id', marketId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('market not found');
  }

  return {
    ...(data as MarketRow),
    market_state: normalizeState((data as MarketRow).market_state)
  };
}

async function executeHouseOrder(input: {
  userId: string;
  marketId: string;
  marketSlug: string;
  side: 'yes' | 'no';
  amountEur: number;
  dayKey: string;
}) {
  const admin = getSupabaseAdminClient();
  const market = await loadMarketWithState(input.marketId);
  const state = market.market_state;

  if (!state) {
    throw new Error('market_state missing');
  }

  if (market.status !== 'open') {
    throw new Error('market not open');
  }

  const quote = buildAmmV0Quote({
    side: input.side,
    action: 'buy',
    inputMode: 'gross_cash',
    amountEur: input.amountEur,
    qYes: Number(state.q_yes),
    qNo: Number(state.q_no),
    depth: Number(market.b_liquidity),
    feeBps: Number(market.fee_bps)
  });

  const quoteHash = `house-bot:${input.dayKey}:${input.marketSlug}:${input.side}:${randomUUID()}`;

  const { error } = await (admin as any).rpc('execute_alpha_trade', {
    p_user_id: input.userId,
    p_market_id: market.id,
    p_side: input.side,
    p_action: 'buy',
    p_amount: quote.amountEur,
    p_avg_price: quote.averagePrice,
    p_share_delta: quote.shareDelta,
    p_fee_amount: quote.feeAmountEur,
    p_total_amount: quote.totalAmountEur,
    p_post_yes_price: quote.postYesPrice,
    p_post_no_price: quote.postNoPrice,
    p_quote_hash: quoteHash,
    p_expected_yes_price: Number(state.yes_price),
    p_expected_no_price: Number(state.no_price),
    p_expected_q_yes: Number(state.q_yes),
    p_expected_q_no: Number(state.q_no),
    p_max_user_exposure: null
  });

  if (error) {
    throw new Error(error.message ?? 'execute_alpha_trade failed');
  }

  return {
    marketId: market.id,
    marketSlug: market.slug,
    side: input.side,
    grossAmount: quote.amountEur,
    shareDelta: quote.shareDelta,
    avgPrice: quote.averagePrice,
    postYesPrice: quote.postYesPrice,
    createdAt: new Date().toISOString(),
    quoteHash
  } satisfies OrderExecutionResult;
}

export async function GET(request: Request) {
  const auth = isOpsAuthorized(request);

  if (!auth.ok) {
    return NextResponse.json({ error: 'unauthorized ops trigger' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const dryRun = parseBoolean(url.searchParams.get('dryRun'), false);

    const enabled = parseBoolean(process.env.HOUSE_LIQUIDITY_BOT_ENABLED, true);
    const houseUserId = process.env.HOUSE_LIQUIDITY_USER_ID?.trim() || '11111111-2222-4333-8444-555555555555';

    if (!enabled && !dryRun) {
      return NextResponse.json(
        {
          status: 'disabled',
          reason: 'HOUSE_LIQUIDITY_BOT_ENABLED=false',
          authMode: auth.mode
        },
        { status: 200 }
      );
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const dayStartIso = getAthensDayStartIso(now);
    const athens = getAthensNowParts(now);
    const dayKey = athens.dayKey;

    const perMarketCap = clamp(Number(process.env.HOUSE_LIQUIDITY_PER_MARKET_DAILY_CAP_EUR ?? '40'), 10, 1_000);
    const globalCap = clamp(Number(process.env.HOUSE_LIQUIDITY_GLOBAL_DAILY_CAP_EUR ?? '140'), 20, 5_000);
    const orderAmount = clamp(Number(process.env.HOUSE_LIQUIDITY_ORDER_EUR ?? '7'), 5, 10);
    const targetMarkets = Math.max(1, Math.min(4, Number(process.env.HOUSE_LIQUIDITY_TARGET_MARKETS ?? '4')));
    const cooldownMinutes = Math.max(5, Number(process.env.HOUSE_LIQUIDITY_COOLDOWN_MIN ?? '45'));
    const nearResolutionHours = Math.max(2, Number(process.env.HOUSE_LIQUIDITY_NEAR_RESOLUTION_HOURS ?? '24'));

    const admin = getSupabaseAdminClient();

    if (!dryRun) {
      await ensureHouseWallet(houseUserId);
    }

    const [{ data: openMarkets, error: marketsError }, { data: todayTrades, error: tradesError }] = await Promise.all([
      admin
        .from('markets')
        .select('id,slug,close_time,status,b_liquidity,fee_bps,market_state(q_yes,q_no,yes_price,no_price,volume_total,last_trade_at)')
        .eq('status', 'open')
        .limit(250),
      admin
        .from('trades')
        .select('market_id,gross_amount,created_at')
        .eq('user_id', houseUserId)
        .gte('created_at', dayStartIso)
        .order('created_at', { ascending: false })
        .limit(4000)
    ]);

    if (marketsError) {
      throw new Error(marketsError.message);
    }

    if (tradesError) {
      throw new Error(tradesError.message);
    }

    const tradeRows = (todayTrades ?? []) as TradeRow[];
    const grossByMarket = new Map<string, number>();
    const lastTradeByMarket = new Map<string, string>();
    let globalGross = 0;

    for (const row of tradeRows) {
      const gross = Number(row.gross_amount ?? 0);
      globalGross += gross;
      grossByMarket.set(row.market_id, Number((grossByMarket.get(row.market_id) ?? 0) + gross));
      if (!lastTradeByMarket.has(row.market_id)) {
        lastTradeByMarket.set(row.market_id, row.created_at);
      }
    }

    const tradedMarketsToday = new Set(grossByMarket.keys());

    const normalizedMarkets = ((openMarkets ?? []) as MarketRow[])
      .map((row) => ({ ...row, market_state: normalizeState(row.market_state) }))
      .filter((row) => Boolean(row.market_state))
      .filter((row) => {
        const closeMs = new Date(row.close_time).getTime();
        if (!Number.isFinite(closeMs)) return false;
        return closeMs - now.getTime() > nearResolutionHours * 60 * 60 * 1000;
      })
      .filter((row) => {
        const state = row.market_state as NonNullable<MarketRow['market_state']>;
        const yesPrice = Number((state as any).yes_price ?? 0.5);
        return yesPrice >= 0.08 && yesPrice <= 0.92;
      })
      .sort((a, b) => {
        const av = Number((a.market_state as any)?.volume_total ?? 0);
        const bv = Number((b.market_state as any)?.volume_total ?? 0);
        return av - bv;
      });

    const existingCount = tradedMarketsToday.size;
    const targetNewMarkets = Math.max(0, targetMarkets - existingCount);

    const candidateNew = normalizedMarkets.filter((market) => !tradedMarketsToday.has(market.id));
    const candidateExisting = normalizedMarkets.filter((market) => tradedMarketsToday.has(market.id));

    const executionPlan = [
      ...candidateNew.slice(0, targetNewMarkets),
      ...candidateExisting
    ].slice(0, targetMarkets);

    if (existingCount >= targetMarkets) {
      const summary = {
        runAt: nowIso,
        dayStartIso,
        dayKey,
        dryRun,
        caps: {
          perMarketCap,
          globalCap,
          orderAmount,
          targetMarkets,
          cooldownMinutes,
          nearResolutionHours
        },
        totals: {
          globalGrossBefore: Number(globalGross.toFixed(2)),
          globalGrossAfter: Number(globalGross.toFixed(2)),
          executedOrders: 0,
          executedMarkets: 0,
          marketsTradedTodayBefore: tradedMarketsToday.size
        },
        executed: [] as OrderExecutionResult[],
        skipped: [{ marketSlug: 'all', reason: 'daily market target already reached' }]
      };

      await (admin as any)
        .from('mission_control_runtime')
        .upsert({ id: LIQUIDITY_RUNTIME_ID, payload: summary, generated_at: nowIso, updated_at: nowIso });

      return NextResponse.json(
        {
          status: 'ok',
          authMode: auth.mode,
          summary
        },
        { status: 200 }
      );
    }

    const executed: OrderExecutionResult[] = [];
    const skipped: Array<{ marketSlug: string; reason: string }> = [];

    let mutableGlobalGross = globalGross;

    for (const market of executionPlan) {
      const marketGross = Number(grossByMarket.get(market.id) ?? 0);
      const marketRemaining = perMarketCap - marketGross;
      const globalRemaining = globalCap - mutableGlobalGross;

      const lastTradeAt = lastTradeByMarket.get(market.id) ?? null;
      const minutesSinceLast = diffMinutes(now, lastTradeAt);

      if (marketGross > 0) {
        skipped.push({ marketSlug: market.slug, reason: 'already traded today' });
        continue;
      }

      if (minutesSinceLast < cooldownMinutes) {
        skipped.push({ marketSlug: market.slug, reason: `cooldown (${cooldownMinutes}m)` });
        continue;
      }

      if (marketRemaining < orderAmount * 2) {
        skipped.push({ marketSlug: market.slug, reason: 'per-market cap reached' });
        continue;
      }

      if (globalRemaining < orderAmount * 2) {
        skipped.push({ marketSlug: market.slug, reason: 'global cap reached' });
        break;
      }

      if (dryRun) {
        skipped.push({ marketSlug: market.slug, reason: 'dry-run planned pair YES/NO' });
        mutableGlobalGross += orderAmount * 2;
        grossByMarket.set(market.id, marketGross + orderAmount * 2);
        continue;
      }

      const yesTrade = await executeHouseOrder({
        userId: houseUserId,
        marketId: market.id,
        marketSlug: market.slug,
        side: 'yes',
        amountEur: orderAmount,
        dayKey
      });

      const noTrade = await executeHouseOrder({
        userId: houseUserId,
        marketId: market.id,
        marketSlug: market.slug,
        side: 'no',
        amountEur: orderAmount,
        dayKey
      });

      executed.push(yesTrade, noTrade);

      mutableGlobalGross += yesTrade.grossAmount + noTrade.grossAmount;
      grossByMarket.set(market.id, marketGross + yesTrade.grossAmount + noTrade.grossAmount);
      lastTradeByMarket.set(market.id, nowIso);
    }

    const summary = {
      runAt: nowIso,
      dayStartIso,
      dayKey,
      dryRun,
      caps: {
        perMarketCap,
        globalCap,
        orderAmount,
        targetMarkets,
        cooldownMinutes,
        nearResolutionHours
      },
      totals: {
        globalGrossBefore: Number(globalGross.toFixed(2)),
        globalGrossAfter: Number(mutableGlobalGross.toFixed(2)),
        executedOrders: executed.length,
        executedMarkets: new Set(executed.map((item) => item.marketId)).size,
        marketsTradedTodayBefore: tradedMarketsToday.size
      },
      executed,
      skipped
    };

    await (admin as any)
      .from('mission_control_runtime')
      .upsert({ id: LIQUIDITY_RUNTIME_ID, payload: summary, generated_at: nowIso, updated_at: nowIso });

    return NextResponse.json(
      {
        status: dryRun ? 'dry-run' : 'ok',
        authMode: auth.mode,
        summary
      },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException(error, {
      tags: { route: 'api/ops/house-liquidity/run' }
    });

    return NextResponse.json(
      {
        error: 'house liquidity run failed',
        detail: error instanceof Error ? error.message : 'unknown'
      },
      { status: 500 }
    );
  }
}
