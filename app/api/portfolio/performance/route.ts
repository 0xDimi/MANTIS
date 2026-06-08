import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { localizedOutcomeLabel, localizedQuestionFromSlug } from '@/lib/market-copy';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { resolveServerLang } from '@/lib/ui-lang-server';
import { tr, type UiLang } from '@/lib/ui-lang';

type PositionRow = {
  market_id: string;
  yes_shares: number | string | null;
  no_shares: number | string | null;
  yes_cost_basis: number | string | null;
  no_cost_basis: number | string | null;
  realized_pnl: number | string | null;
  updated_at: string;
};

type TradeRow = {
  id: string;
  market_id: string;
  side: 'yes' | 'no';
  action: 'buy' | 'sell';
  gross_amount: number | string;
  fee_amount: number | string;
  net_amount: number | string;
  created_at: string;
};

type LedgerRow = {
  id: string;
  entry_type: 'seed' | 'trade_buy' | 'trade_sell' | 'settlement' | 'void_refund' | 'manual_adjustment';
  amount: number | string;
  balance_after: number | string;
  trade_id: string | null;
  market_id: string | null;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
};

type MarketRow = {
  id: string;
  slug: string;
  question: string;
  category: string;
  status: string;
};

type MarketStateRow = {
  market_id: string;
  yes_price: number | string;
  no_price: number | string;
};

type ResolutionRow = {
  market_id: string;
  outcome: 'yes' | 'no' | 'void';
  created_at: string;
};

type SettlementEntryRow = {
  market_id: string;
  created_at: string;
  payout_amount: number | string;
  refund_amount: number | string;
  realized_delta: number | string;
  yes_shares_closed: number | string;
  no_shares_closed: number | string;
};

type PortfolioRange = '1D' | '7D' | '1M' | 'YTD' | 'ALL';

type PortfolioChartPoint = {
  timestamp: string;
  value: number;
};

type RangePnlSummary = {
  range: PortfolioRange;
  pnlAmount: number;
  pnlPct: number | null;
  label: string;
};

function round2(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function parseRange(raw: string | null): PortfolioRange {
  const normalized = (raw ?? '').toUpperCase();
  if (normalized === '1D') return '1D';
  if (normalized === '7D' || normalized === '1W') return '7D';
  if (normalized === '1M') return '1M';
  if (normalized === 'YTD') return 'YTD';
  return 'ALL';
}

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

function rangeLabel(range: PortfolioRange, lang: UiLang) {
  if (range === '1D') return tr(lang, 'Today', 'Σήμερα');
  if (range === '7D') return tr(lang, 'Last 7 days', 'Τελευταίες 7 ημέρες');
  if (range === '1M') return tr(lang, 'Last 30 days', 'Τελευταίες 30 ημέρες');
  if (range === 'YTD') return tr(lang, 'Year to date', 'Από αρχή έτους');
  return tr(lang, 'All time', 'Από την αρχή');
}

function rangeStart(range: PortfolioRange, now = new Date()) {
  const base = new Date(now);

  if (range === '1D') {
    base.setHours(base.getHours() - 24);
    return base;
  }

  if (range === '7D') {
    base.setDate(base.getDate() - 7);
    return base;
  }

  if (range === '1M') {
    base.setDate(base.getDate() - 30);
    return base;
  }

  if (range === 'YTD') {
    return new Date(base.getFullYear(), 0, 1);
  }

  return null;
}

function targetPointCount(range: PortfolioRange) {
  if (range === '1D') return 48;
  if (range === '7D') return 42;
  if (range === '1M') return 60;
  if (range === 'YTD') return 90;
  return 120;
}

function dedupeAndSortPoints(points: PortfolioChartPoint[]) {
  const deduped = new Map<number, PortfolioChartPoint>();

  for (const point of points) {
    const timestamp = new Date(point.timestamp).getTime();
    if (!Number.isFinite(timestamp) || !Number.isFinite(point.value)) continue;
    deduped.set(timestamp, {
      timestamp: new Date(timestamp).toISOString(),
      value: round2(point.value)
    });
  }

  return [...deduped.entries()]
    .sort((left, right) => left[0] - right[0])
    .map(([, point]) => point);
}

function downsampleLttb(points: PortfolioChartPoint[], threshold: number) {
  if (threshold >= points.length || threshold <= 2) return points.slice();

  const sampled: PortfolioChartPoint[] = [];
  const bucketSize = (points.length - 2) / (threshold - 2);
  let anchorIndex = 0;

  sampled.push(points[anchorIndex]);

  for (let bucketIndex = 0; bucketIndex < threshold - 2; bucketIndex += 1) {
    const rangeStartIndex = Math.floor(bucketIndex * bucketSize) + 1;
    const rangeEndIndex = Math.min(Math.floor((bucketIndex + 1) * bucketSize) + 1, points.length - 1);
    const nextRangeStartIndex = Math.floor((bucketIndex + 1) * bucketSize) + 1;
    const nextRangeEndIndex = Math.min(Math.floor((bucketIndex + 2) * bucketSize) + 1, points.length);

    let avgX = 0;
    let avgY = 0;
    const avgRangeLength = Math.max(nextRangeEndIndex - nextRangeStartIndex, 1);

    for (let index = nextRangeStartIndex; index < nextRangeEndIndex; index += 1) {
      avgX += new Date(points[index].timestamp).getTime();
      avgY += points[index].value;
    }

    avgX /= avgRangeLength;
    avgY /= avgRangeLength;

    const anchorX = new Date(points[anchorIndex].timestamp).getTime();
    const anchorY = points[anchorIndex].value;

    let maxArea = -1;
    let candidateIndex = rangeStartIndex;

    for (let index = rangeStartIndex; index < rangeEndIndex; index += 1) {
      const pointX = new Date(points[index].timestamp).getTime();
      const pointY = points[index].value;
      const area = Math.abs((anchorX - avgX) * (pointY - anchorY) - (anchorX - pointX) * (avgY - anchorY));

      if (area > maxArea) {
        maxArea = area;
        candidateIndex = index;
      }
    }

    sampled.push(points[candidateIndex]);
    anchorIndex = candidateIndex;
  }

  sampled.push(points[points.length - 1]);
  return sampled;
}

function buildChartAndPnl({
  range,
  lang,
  availableSeries,
  currentPortfolioValue,
  currentTimestamp
}: {
  range: PortfolioRange;
  lang: UiLang;
  availableSeries: PortfolioChartPoint[];
  currentPortfolioValue: number;
  currentTimestamp: string;
}) {
  const ordered = dedupeAndSortPoints(availableSeries);

  const fallbackPoint: PortfolioChartPoint = {
    timestamp: currentTimestamp,
    value: round2(currentPortfolioValue)
  };

  const allPoints = ordered.length ? ordered : [fallbackPoint];
  const now = new Date(currentTimestamp);
  const start = rangeStart(range, now);
  const startMs = start?.getTime() ?? null;

  let baselinePoint = allPoints[0];
  if (startMs != null) {
    const candidate = [...allPoints].reverse().find((point) => new Date(point.timestamp).getTime() <= startMs);
    baselinePoint = candidate ?? allPoints[0];
  }

  let visiblePoints = allPoints;
  if (startMs != null) {
    const firstInRangeIndex = allPoints.findIndex((point) => new Date(point.timestamp).getTime() >= startMs);
    if (firstInRangeIndex === -1) {
      visiblePoints = [baselinePoint, fallbackPoint];
    } else {
      const baselineIndex = Math.max(firstInRangeIndex - 1, 0);
      visiblePoints = allPoints.slice(baselineIndex);
    }
  }

  const lastVisiblePoint = visiblePoints[visiblePoints.length - 1];
  if (!lastVisiblePoint || lastVisiblePoint.timestamp !== fallbackPoint.timestamp || lastVisiblePoint.value !== fallbackPoint.value) {
    visiblePoints = [...visiblePoints, fallbackPoint];
  }

  const chart = downsampleLttb(dedupeAndSortPoints(visiblePoints), targetPointCount(range));
  const pnlAmount = round2(currentPortfolioValue - baselinePoint.value);
  const pnlPct = baselinePoint.value > 0 ? round2(pnlAmount / baselinePoint.value) : null;

  return {
    chart,
    selectedRangePnl: {
      range,
      pnlAmount,
      pnlPct,
      label: rangeLabel(range, lang)
    } satisfies RangePnlSummary
  };
}

function hasOpenExposure(position: PositionRow) {
  return (
    toNumber(position.yes_shares) > 0 ||
    toNumber(position.no_shares) > 0 ||
    toNumber(position.yes_cost_basis) > 0 ||
    toNumber(position.no_cost_basis) > 0
  );
}

function deriveHistoryResult({
  outcome,
  realizedPnl,
  yesSharesClosed,
  noSharesClosed
}: {
  outcome: string | null;
  realizedPnl: number;
  yesSharesClosed: number;
  noSharesClosed: number;
}) {
  if (outcome === 'void') return 'void' as const;
  if (realizedPnl > 0.004) return 'won' as const;
  if (realizedPnl < -0.004) return 'lost' as const;
  if (outcome === 'yes' && yesSharesClosed > noSharesClosed) return 'won' as const;
  if (outcome === 'no' && noSharesClosed > yesSharesClosed) return 'won' as const;
  if (outcome === 'yes' && noSharesClosed > yesSharesClosed) return 'lost' as const;
  if (outcome === 'no' && yesSharesClosed > noSharesClosed) return 'lost' as const;
  return 'flat' as const;
}

function buildActivityLabel(row: LedgerRow, trade: TradeRow | null, lang: UiLang) {
  if (row.entry_type === 'seed') return tr(lang, 'Starting balance', 'Αρχικό υπόλοιπο');
  if (row.entry_type === 'manual_adjustment') return tr(lang, 'Adjustment', 'Προσαρμογή');
  if (row.entry_type === 'void_refund') return tr(lang, 'Void refund', 'Επιστροφή ακύρωσης');
  if (row.entry_type === 'settlement') return tr(lang, 'Settlement payout', 'Πληρωμή διακανονισμού');
  if (row.entry_type === 'trade_buy') {
    return trade
      ? `${tr(lang, 'Buy', 'Αγορά')} ${localizedOutcomeLabel(trade.side, trade.side, lang)}`
      : tr(lang, 'Buy', 'Αγορά');
  }
  if (row.entry_type === 'trade_sell') {
    return trade
      ? `${tr(lang, 'Sell', 'Πώληση')} ${localizedOutcomeLabel(trade.side, trade.side, lang)}`
      : tr(lang, 'Sell', 'Πώληση');
  }
  return tr(lang, 'Activity', 'Δραστηριότητα');
}

function buildActivityDetail(row: LedgerRow, trade: TradeRow | null, resolution: ResolutionRow | null, lang: UiLang) {
  if (row.entry_type === 'trade_buy' || row.entry_type === 'trade_sell') {
    if (!trade) return null;
    return {
      primary:
        trade.action === 'buy'
          ? tr(lang, 'Cash committed to position', 'Κεφάλαιο που δεσμεύτηκε για τη θέση')
          : tr(lang, 'Cash released from position', 'Κεφάλαιο που αποδεσμεύτηκε από τη θέση'),
      secondary: `${tr(lang, 'Fee', 'Χρέωση')} €${round2(toNumber(trade.fee_amount)).toFixed(2)}`
    };
  }

  if (row.entry_type === 'settlement' || row.entry_type === 'void_refund') {
    const outcomeLabel = resolution?.outcome
      ? resolution.outcome === 'void'
        ? tr(lang, 'Void', 'Άκυρο')
        : localizedOutcomeLabel(resolution.outcome, resolution.outcome, lang)
      : null;
    return {
      primary: outcomeLabel
        ? `${tr(lang, 'Resolved', 'Επιλύθηκε')} ${outcomeLabel}`
        : row.entry_type === 'void_refund'
          ? tr(lang, 'Market voided', 'Η αγορά ακυρώθηκε')
          : tr(lang, 'Market settled', 'Η αγορά διακανονίστηκε'),
      secondary: null
    };
  }

  if (row.entry_type === 'seed') {
    return {
      primary: tr(lang, 'Paper wallet initialized', 'Το paper wallet αρχικοποιήθηκε'),
      secondary: null
    };
  }

  return null;
}

export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    const url = new URL(request.url);
    const lang = await resolveServerLang({ searchParam: url.searchParams.get('lang') });
    const range = parseRange(url.searchParams.get('range'));
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'auth required' }, { status: 401 });
    }

    Sentry.setUser({ id: user.id });

    const [{ data: wallet, error: walletError }, { data: positions, error: positionsError }, { data: trades, error: tradesError }] = await Promise.all([
      supabase
        .from('wallet_accounts')
        .select('id,currency,starting_balance,available_balance,realized_pnl,updated_at')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle(),
      supabase
        .from('positions')
        .select('market_id,yes_shares,no_shares,yes_cost_basis,no_cost_basis,realized_pnl,updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false }),
      supabase
        .from('trades')
        .select('id,market_id,side,action,gross_amount,fee_amount,net_amount,created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(500)
    ]);

    if (walletError) {
      Sentry.captureException(new Error(walletError.message), {
        tags: { route: 'api/portfolio/performance' }
      });
      return NextResponse.json({ error: walletError.message }, { status: 500 });
    }

    if (positionsError) {
      Sentry.captureException(new Error(positionsError.message), {
        tags: { route: 'api/portfolio/performance' }
      });
      return NextResponse.json({ error: positionsError.message }, { status: 500 });
    }

    if (tradesError) {
      Sentry.captureException(new Error(tradesError.message), {
        tags: { route: 'api/portfolio/performance' }
      });
      return NextResponse.json({ error: tradesError.message }, { status: 500 });
    }

    const walletRow = wallet as {
      id: string;
      starting_balance: number | string;
      available_balance: number | string;
      updated_at?: string | null;
    } | null;
    const positionRows = (positions ?? []) as PositionRow[];
    const tradeRows = (trades ?? []) as TradeRow[];

    const ledgerResult = walletRow
      ? await supabase
          .from('ledger_entries')
          .select('id,entry_type,amount,balance_after,trade_id,market_id,metadata_json,created_at')
          .eq('wallet_account_id', walletRow.id)
          .order('created_at', { ascending: true })
          .limit(500)
      : { data: [] as LedgerRow[], error: null as { message: string } | null };

    if (ledgerResult.error) {
      Sentry.captureException(new Error(ledgerResult.error.message), {
        tags: { route: 'api/portfolio/performance' }
      });
      return NextResponse.json({ error: ledgerResult.error.message }, { status: 500 });
    }

    const ledgerRows = (ledgerResult.data ?? []) as LedgerRow[];
    const marketIds = [...new Set([
      ...positionRows.map((row) => row.market_id),
      ...tradeRows.map((row) => row.market_id),
      ...ledgerRows.map((row) => row.market_id).filter(Boolean) as string[]
    ].filter(Boolean))];

    const [marketsResult, statesResult, resolutionsResult, settlementEntriesResult] = await Promise.all([
      marketIds.length
        ? supabase.from('markets').select('id,slug,question,category,status').in('id', marketIds)
        : Promise.resolve({ data: [] as MarketRow[], error: null as { message: string } | null }),
      marketIds.length
        ? supabase.from('market_state').select('market_id,yes_price,no_price').in('market_id', marketIds)
        : Promise.resolve({ data: [] as MarketStateRow[], error: null as { message: string } | null }),
      marketIds.length
        ? supabase.from('resolutions').select('market_id,outcome,created_at').in('market_id', marketIds)
        : Promise.resolve({ data: [] as ResolutionRow[], error: null as { message: string } | null }),
      marketIds.length
        ? supabase
            .from('market_settlement_entries')
            .select('market_id,created_at,payout_amount,refund_amount,realized_delta,yes_shares_closed,no_shares_closed')
            .eq('user_id', user.id)
            .in('market_id', marketIds)
        : Promise.resolve({ data: [] as SettlementEntryRow[], error: null as { message: string } | null })
    ]);

    if (marketsResult.error) {
      Sentry.captureException(new Error(marketsResult.error.message), {
        tags: { route: 'api/portfolio/performance' }
      });
      return NextResponse.json({ error: marketsResult.error.message }, { status: 500 });
    }

    if (statesResult.error) {
      Sentry.captureException(new Error(statesResult.error.message), {
        tags: { route: 'api/portfolio/performance' }
      });
      return NextResponse.json({ error: statesResult.error.message }, { status: 500 });
    }

    if (resolutionsResult.error) {
      Sentry.captureException(new Error(resolutionsResult.error.message), {
        tags: { route: 'api/portfolio/performance' }
      });
      return NextResponse.json({ error: resolutionsResult.error.message }, { status: 500 });
    }

    if (settlementEntriesResult.error) {
      Sentry.captureException(new Error(settlementEntriesResult.error.message), {
        tags: { route: 'api/portfolio/performance' }
      });
      return NextResponse.json({ error: settlementEntriesResult.error.message }, { status: 500 });
    }

    const marketMap = new Map((marketsResult.data ?? []).map((row) => [row.id, row]));
    const stateMap = new Map((statesResult.data ?? []).map((row) => [row.market_id, row]));
    const resolutionMap = new Map((resolutionsResult.data ?? []).map((row) => [row.market_id, row]));
    const settlementEntryMap = new Map((settlementEntriesResult.data ?? []).map((row) => [row.market_id, row]));
    const tradeMap = new Map(tradeRows.map((row) => [row.id, row]));

    const distinctTradedMarkets = new Set(tradeRows.map((row) => row.market_id).filter(Boolean));

    const openExposure = round2(
      positionRows
        .filter((position) => hasOpenExposure(position))
        .reduce((sum, position) => {
          const state = stateMap.get(position.market_id);
          const yesValue = toNumber(position.yes_shares) * toNumber(state?.yes_price);
          const noValue = toNumber(position.no_shares) * toNumber(state?.no_price);
          return sum + yesValue + noValue;
        }, 0)
    );

    const availableCash = round2(toNumber(walletRow?.available_balance));
    const totalAccountValue = round2(availableCash + openExposure);
    const cashSharePct = totalAccountValue > 0 ? round2((availableCash / totalAccountValue) * 100) : 0;
    const openExposureSharePct = totalAccountValue > 0 ? round2((openExposure / totalAccountValue) * 100) : 0;

    const committedCashByMarket = new Map<string, number>();
    for (const trade of tradeRows) {
      if (trade.action !== 'buy') continue;
      const current = committedCashByMarket.get(trade.market_id) ?? 0;
      committedCashByMarket.set(trade.market_id, current + Math.abs(toNumber(trade.net_amount)));
    }

    const settledMarkets = positionRows
      .map((position) => {
        const market = marketMap.get(position.market_id);
        const resolution = resolutionMap.get(position.market_id) ?? null;
        const settlementEntry = settlementEntryMap.get(position.market_id) ?? null;

        if (!market) return null;
        if (!['settled', 'resolved', 'void'].includes(market.status) && !resolution && !settlementEntry) return null;

        const realizedPnl = round2(toNumber(position.realized_pnl));
        const yesSharesClosed = toNumber(settlementEntry?.yes_shares_closed);
        const noSharesClosed = toNumber(settlementEntry?.no_shares_closed);
        const investedCash = round2(committedCashByMarket.get(position.market_id) ?? 0);
        const returnPct = investedCash > 0 ? round2((realizedPnl / investedCash) * 100) : null;
        const outcome = resolution?.outcome ?? null;
        const result = deriveHistoryResult({
          outcome,
          realizedPnl,
          yesSharesClosed,
          noSharesClosed
        });
        const settledAt = settlementEntry?.created_at ?? resolution?.created_at ?? position.updated_at;

        return {
          marketId: position.market_id,
          market: {
            slug: market.slug,
            question: localizedQuestionFromSlug(market.slug, market.question, lang),
            category: market.category,
            status: market.status
          },
          realizedPnl,
          committedCash: investedCash,
          returnPct,
          settledAt,
          result
        };
      })
      .filter(Boolean) as Array<{
        marketId: string;
        market: { slug: string; question: string; category: string; status: string };
        realizedPnl: number;
        committedCash: number;
        returnPct: number | null;
        settledAt: string;
        result: 'won' | 'lost' | 'void' | 'flat';
      }>;

    const attribution = settledMarkets
      .slice()
      .sort((a, b) => {
        if (b.realizedPnl !== a.realizedPnl) return b.realizedPnl - a.realizedPnl;
        return new Date(b.settledAt).getTime() - new Date(a.settledAt).getTime();
      });

    const wins = settledMarkets.filter((item) => item.result === 'won').length;
    const losses = settledMarkets.filter((item) => item.result === 'lost').length;
    const voids = settledMarkets.filter((item) => item.result === 'void').length;
    const flats = settledMarkets.filter((item) => item.result === 'flat').length;
    const winRate = wins + losses > 0 ? round2((wins / (wins + losses)) * 100) : null;
    const returnValues = settledMarkets
      .map((item) => item.returnPct)
      .filter((value): value is number => value != null && Number.isFinite(value));
    const avgSettledReturnPct = returnValues.length
      ? round2(returnValues.reduce((sum, value) => sum + value, 0) / returnValues.length)
      : null;

    const bestMarket = attribution.length ? attribution[0] : null;
    const worstMarket = attribution.length ? attribution[attribution.length - 1] : null;

    const series = ledgerRows.map((row) => ({
      time: row.created_at,
      balanceAfter: round2(toNumber(row.balance_after)),
      entryType: row.entry_type
    }));

    if (!series.length && walletRow) {
      series.push({
        time: new Date().toISOString(),
        balanceAfter: round2(toNumber(walletRow.starting_balance)),
        entryType: 'seed'
      });
    } else if (series.length && ledgerRows[0]?.entry_type !== 'seed' && walletRow) {
      series.unshift({
        time: series[0].time,
        balanceAfter: round2(toNumber(walletRow.starting_balance)),
        entryType: 'seed'
      });
    }

    const entries = ledgerRows
      .slice()
      .reverse()
      .map((row) => {
        const market = row.market_id ? marketMap.get(row.market_id) ?? null : null;
        const trade = row.trade_id ? tradeMap.get(row.trade_id) ?? null : null;
        const resolution = row.market_id ? resolutionMap.get(row.market_id) ?? null : null;
        const detail = buildActivityDetail(row, trade, resolution, lang);

        return {
          id: row.id,
          entryType: row.entry_type,
          amount: round2(toNumber(row.amount)),
          balanceAfter: round2(toNumber(row.balance_after)),
          createdAt: row.created_at,
          label: buildActivityLabel(row, trade, lang),
          detail: detail?.primary ?? null,
          detailSecondary: detail?.secondary ?? null,
          market: market
            ? {
                slug: market.slug,
                question: localizedQuestionFromSlug(market.slug, market.question, lang),
                category: market.category,
                status: market.status
              }
            : null
        };
      });

    const currentTimestamp = walletRow?.updated_at ?? entries[0]?.createdAt ?? new Date().toISOString();
    const chartInput = series.map((point) => ({
      timestamp: point.time,
      value: round2(point.balanceAfter + openExposure)
    }));
    const { chart, selectedRangePnl } = buildChartAndPnl({
      range,
      lang,
      availableSeries: chartInput,
      currentPortfolioValue: totalAccountValue,
      currentTimestamp
    });

    return NextResponse.json(
      {
        userId: user.id,
        selectedRange: range,
        selectedRangePnl,
        chart,
        lastUpdatedAt: currentTimestamp,
        summary: {
          marketsTraded: distinctTradedMarkets.size,
          settledMarkets: settledMarkets.length,
          winCount: wins,
          lossCount: losses,
          voidCount: voids,
          flatCount: flats,
          winRate,
          avgSettledReturnPct
        },
        bestMarket,
        worstMarket,
        attribution,
        accountSplit: {
          availableCash,
          openExposure,
          totalAccountValue,
          cashSharePct,
          openExposureSharePct
        },
        activity: {
          series,
          entries
        }
      },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException(error, {
      tags: { route: 'api/portfolio/performance' }
    });

    return NextResponse.json(
      {
        error: 'portfolio performance unavailable',
        detail: error instanceof Error ? error.message : 'unknown'
      },
      { status: 500 }
    );
  }
}
