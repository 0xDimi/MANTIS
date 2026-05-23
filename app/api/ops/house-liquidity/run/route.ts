import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { buildAmmV0Quote } from '@/lib/amm-v0';
import {
  getAthensDayStartIso,
  getAthensNowParts,
  getAthensOffsetMs,
  isOpsAuthorized,
  parseBoolean
} from '@/lib/ops-automation';
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

type TradeReportRow = TradeRow & {
  id: string;
  side: 'yes' | 'no';
  action: 'buy' | 'sell';
  share_delta: number;
  avg_price: number;
  fee_amount: number;
  net_amount: number;
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

function round2(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function getAthensWeekStartIso(now = new Date()) {
  const offsetMs = getAthensOffsetMs(now);
  const athensNowMs = now.getTime() + offsetMs;
  const dayStartMsAthensClock = Math.floor(athensNowMs / 86_400_000) * 86_400_000;
  const dayOfWeek = new Date(athensNowMs).getUTCDay() || 7;
  const weekStartMsAthensClock = dayStartMsAthensClock - (dayOfWeek - 1) * 86_400_000;

  return new Date(weekStartMsAthensClock - offsetMs).toISOString();
}

function getAthensDateTimeLabel(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Athens',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  })
    .format(new Date(iso))
    .replace(',', '');
}

async function buildHouseLiquidityReport(input: { houseUserId: string; now: Date }) {
  const admin = getSupabaseAdminClient();
  const startIso = getAthensWeekStartIso(input.now);
  const endIso = input.now.toISOString();

  const { data: trades, error: tradesError } = await admin
    .from('trades')
    .select('id,market_id,side,action,share_delta,avg_price,gross_amount,fee_amount,net_amount,created_at')
    .eq('user_id', input.houseUserId)
    .gte('created_at', startIso)
    .lte('created_at', endIso)
    .order('created_at', { ascending: true });

  if (tradesError) {
    throw new Error(tradesError.message);
  }

  const tradeRows = (trades ?? []) as TradeReportRow[];
  const marketIds = [...new Set(tradeRows.map((trade) => trade.market_id).filter(Boolean))];

  const { data: markets, error: marketsError } = marketIds.length
    ? await admin.from('markets').select('id,slug,question,category,status').in('id', marketIds)
    : { data: [] as any[], error: null };

  if (marketsError) {
    throw new Error(marketsError.message);
  }

  const marketMap = new Map((markets ?? []).map((market: any) => [market.id, market]));
  const byDay = new Map<string, { tradeCount: number; grossVolume: number; fees: number; netAmount: number }>();
  const byMarket = new Map<
    string,
    {
      slug: string;
      question: string;
      tradeCount: number;
      grossVolume: number;
      fees: number;
      netAmount: number;
      yesBuys: number;
      noBuys: number;
      yesSells: number;
      noSells: number;
      firstAt: string;
      lastAt: string;
    }
  >();

  let grossVolume = 0;
  let fees = 0;
  let netAmount = 0;

  for (const trade of tradeRows) {
    const gross = Number(trade.gross_amount ?? 0);
    const fee = Number(trade.fee_amount ?? 0);
    const net = Number(trade.net_amount ?? 0);

    grossVolume += gross;
    fees += fee;
    netAmount += net;

    const dayKey = getAthensDateTimeLabel(trade.created_at).slice(0, 10).split('/').reverse().join('-');
    const dayRow = byDay.get(dayKey) ?? { tradeCount: 0, grossVolume: 0, fees: 0, netAmount: 0 };
    dayRow.tradeCount += 1;
    dayRow.grossVolume += gross;
    dayRow.fees += fee;
    dayRow.netAmount += net;
    byDay.set(dayKey, dayRow);

    const market = marketMap.get(trade.market_id) ?? null;
    const marketRow = byMarket.get(trade.market_id) ?? {
      slug: market?.slug ?? trade.market_id,
      question: market?.question ?? '',
      tradeCount: 0,
      grossVolume: 0,
      fees: 0,
      netAmount: 0,
      yesBuys: 0,
      noBuys: 0,
      yesSells: 0,
      noSells: 0,
      firstAt: trade.created_at,
      lastAt: trade.created_at
    };

    marketRow.tradeCount += 1;
    marketRow.grossVolume += gross;
    marketRow.fees += fee;
    marketRow.netAmount += net;

    if (trade.side === 'yes' && trade.action === 'buy') marketRow.yesBuys += 1;
    if (trade.side === 'no' && trade.action === 'buy') marketRow.noBuys += 1;
    if (trade.side === 'yes' && trade.action === 'sell') marketRow.yesSells += 1;
    if (trade.side === 'no' && trade.action === 'sell') marketRow.noSells += 1;

    if (new Date(trade.created_at).getTime() < new Date(marketRow.firstAt).getTime()) {
      marketRow.firstAt = trade.created_at;
    }

    if (new Date(trade.created_at).getTime() > new Date(marketRow.lastAt).getTime()) {
      marketRow.lastAt = trade.created_at;
    }

    byMarket.set(trade.market_id, marketRow);
  }

  return {
    generatedAt: endIso,
    window: {
      startAthens: getAthensDateTimeLabel(startIso),
      endAthens: getAthensDateTimeLabel(endIso),
      startIso,
      endIso
    },
    totals: {
      tradeCount: tradeRows.length,
      grossVolume: round2(grossVolume),
      fees: round2(fees),
      netAmount: round2(netAmount)
    },
    byDay: [...byDay.entries()].map(([day, row]) => ({
      day,
      tradeCount: row.tradeCount,
      grossVolume: round2(row.grossVolume),
      fees: round2(row.fees),
      netAmount: round2(row.netAmount)
    })),
    byMarket: [...byMarket.values()]
      .sort((a, b) => b.grossVolume - a.grossVolume)
      .map((row) => ({
        ...row,
        grossVolume: round2(row.grossVolume),
        fees: round2(row.fees),
        netAmount: round2(row.netAmount),
        firstAthens: getAthensDateTimeLabel(row.firstAt),
        lastAthens: getAthensDateTimeLabel(row.lastAt)
      })),
    trades: tradeRows.map((trade) => {
      const market = marketMap.get(trade.market_id) ?? null;

      return {
        id: trade.id,
        athensTime: getAthensDateTimeLabel(trade.created_at),
        marketSlug: market?.slug ?? trade.market_id,
        side: trade.side,
        action: trade.action,
        shareDelta: Number(Number(trade.share_delta ?? 0).toFixed(4)),
        avgPrice: Number(Number(trade.avg_price ?? 0).toFixed(4)),
        grossAmount: round2(Number(trade.gross_amount ?? 0)),
        feeAmount: round2(Number(trade.fee_amount ?? 0)),
        netAmount: round2(Number(trade.net_amount ?? 0))
      };
    })
  };
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
    const now = new Date();

    if (url.searchParams.get('report') === 'week') {
      const report = await buildHouseLiquidityReport({ houseUserId, now });

      return NextResponse.json(
        {
          status: 'ok',
          authMode: auth.mode,
          report
        },
        { status: 200 }
      );
    }

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
