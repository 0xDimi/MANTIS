'use client';

import Link from 'next/link';
import { startTransition, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { captureEvent } from '@/lib/client-telemetry';
import { formatEur } from '@/lib/format';
import { localizedCategory, localizedMarketStatus, localizedOutcomeLabel, localizedQuestionFromSlug } from '@/lib/market-copy';
import { tr, type UiLang } from '@/lib/ui-lang';

type PortfolioRange = '1D' | '7D' | '1M' | 'YTD' | 'ALL';
type PortfolioTab = 'positions' | 'open' | 'history';
type HistoryFilter = 'all' | 'settled' | 'trades' | 'cash';

type PortfolioPayload = {
  wallet?: {
    currency: string;
    startingBalance: number;
    availableBalance: number;
    realizedPnl: number;
    updatedAt: string;
  } | null;
  totals?: {
    costBasis: number;
    marketValue: number;
    unrealizedPnl: number;
  };
  positions?: Array<{
    marketId: string;
    market: {
      slug: string;
      question: string;
      status: string;
      category: string;
      closeTime?: string | null;
    } | null;
    pricing?: {
      yesPrice: number;
      noPrice: number;
    } | null;
    position: {
      yesShares: number;
      noShares: number;
      yesCostBasis: number;
      noCostBasis: number;
      realizedPnl: number;
      unrealizedPnl: number;
      marketValue: number;
    };
  }>;
  history?: Array<{
    marketId: string;
    market: {
      slug: string;
      question: string;
      category: string;
      status: string;
    };
    positionSide: 'yes' | 'no' | 'mixed';
    resolutionOutcome: 'yes' | 'no' | 'void' | null;
    result: 'won' | 'lost' | 'void' | 'flat';
    realizedPnl: number;
    settledAt: string;
    yesSharesClosed: number;
    noSharesClosed: number;
    payoutAmount: number;
    refundAmount: number;
  }>;
  error?: string;
};

type TradeHistoryPayload = {
  count?: number;
  trades?: Array<{
    id: string;
    marketId: string;
    market: {
      slug: string;
      question: string;
      category: string;
      status: string;
    } | null;
    side: 'yes' | 'no';
    action: 'buy' | 'sell';
    shareDelta: number;
    avgPrice: number;
    grossAmount: number;
    feeAmount: number;
    netAmount: number;
    createdAt: string;
    resolution?: {
      outcome: 'yes' | 'no' | 'void';
      createdAt: string;
    } | null;
    settlement?: {
      createdAt: string;
      realizedDelta: number;
      payoutAmount: number;
      refundAmount: number;
    } | null;
  }>;
  error?: string;
};

type PerformancePayload = {
  selectedRange?: PortfolioRange;
  selectedRangePnl?: {
    range: PortfolioRange;
    pnlAmount: number;
    pnlPct: number | null;
    label: string;
  };
  chart?: Array<{
    timestamp: string;
    value: number;
  }>;
  lastUpdatedAt?: string;
  summary?: {
    marketsTraded: number;
    settledMarkets: number;
    winCount: number;
    lossCount: number;
    voidCount: number;
    flatCount: number;
    winRate: number | null;
    avgSettledReturnPct: number | null;
  };
  attribution?: Array<{
    marketId: string;
    market: {
      slug: string;
      question: string;
      category: string;
      status: string;
    };
    realizedPnl: number;
    committedCash: number;
    returnPct: number | null;
    settledAt: string;
    result: 'won' | 'lost' | 'void' | 'flat';
  }>;
  activity?: {
    series: Array<{
      time: string;
      balanceAfter: number;
      entryType: string;
    }>;
    entries: Array<{
      id: string;
      entryType: string;
      amount: number;
      balanceAfter: number;
      createdAt: string;
      label: string;
      detail: string | null;
      detailSecondary: string | null;
      market: {
        slug: string;
        question: string;
        category: string;
        status: string;
      } | null;
    }>;
  };
  error?: string;
};

type CategoricalPayload = {
  openEvents?: Array<{
    eventId: string;
    event: {
      slug: string;
      title: string;
      category: string;
      status: string;
      closeTime: string;
    };
    exposure: number;
    marketValue: number;
    unrealizedPnl: number;
    outcomes: Array<{
      outcomeId: string;
      label: string;
      outcomeKey: string;
      shares: number;
      costBasis: number;
      probability: number;
      marketValue: number;
      unrealizedPnl: number;
      payoutIfWins: number;
    }>;
  }>;
  history?: Array<{
    eventId: string;
    event: {
      slug: string;
      title: string;
      category: string;
      status: string;
    };
    resolutionType: 'winner' | 'void' | null;
    winningOutcomeLabel: string | null;
    payoutAmount: number;
    refundAmount: number;
    realizedDelta: number;
    winningSharesClosed: number;
    totalCostBasisClosed: number;
    settledAt: string;
  }>;
  error?: string;
};

type CategoricalTradeHistoryPayload = {
  trades?: Array<{
    id: string;
    eventId: string;
    event: {
      slug: string;
      title: string;
      category: string;
      status: string;
    } | null;
    outcomeLabel: string;
    action: 'buy' | 'sell';
    shareDelta: number;
    avgPrice: number;
    grossAmount: number;
    feeAmount: number;
    netAmount: number;
    createdAt: string;
  }>;
  error?: string;
};

async function readJsonSafely<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return null;
  }

  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

type PositionRow = {
  id: string;
  marketType: 'binary' | 'categorical';
  href: string;
  tradeHref: string;
  question: string;
  category: string;
  status: string;
  closeTime: string | null;
  positionLabel: string;
  positionTone: 'yes' | 'no' | 'neutral';
  sharesLabel: string;
  sharesValue: number;
  avgEntryPrice: number | null;
  currentPrice: number | null;
  currentChangePct: number | null;
  currentValue: number;
  unrealizedPnl: number;
  unrealizedPct: number | null;
  marketMeta: string;
};

type HistoryRow = {
  id: string;
  kind: 'settlement' | 'trade' | 'cash';
  href: string | null;
  title: string;
  subtitle: string;
  amount: number;
  amountLabel: string;
  typeLabel: string;
  typeTitle: string;
  detailPrimary: string;
  detailSecondary: string;
  createdAt: string;
};

type ChartPoint = {
  timestamp: string;
  value: number;
};

const RANGE_OPTIONS: PortfolioRange[] = ['1D', '7D', '1M', 'YTD', 'ALL'];

function parseRange(value: string | null): PortfolioRange {
  const normalized = (value ?? '').toUpperCase();
  if (normalized === '1W') return '7D';
  return RANGE_OPTIONS.includes(normalized as PortfolioRange) ? (normalized as PortfolioRange) : '1M';
}

function parseTab(value: string | null): PortfolioTab {
  const normalized = (value ?? '').toLowerCase();
  if (normalized === 'open' || normalized === 'history') return normalized;
  return 'positions';
}

function parseHistoryFilter(value: string | null): HistoryFilter {
  const normalized = (value ?? '').toLowerCase();
  if (normalized === 'settled' || normalized === 'trades' || normalized === 'cash') return normalized;
  return 'all';
}

function formatSignedMoney(value: number, lang: UiLang) {
  const abs = formatEur(Math.abs(value), lang);
  if (value > 0) return `+${abs}`;
  if (value < 0) return `-${abs}`;
  return formatEur(0, lang);
}

function formatProbability(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return '—';
  return `${Math.round(value * 100)}%`;
}

function formatSignedPercent(value: number | null | undefined, digits = 1) {
  if (value == null || !Number.isFinite(value)) return '—';
  const abs = Math.abs(value * 100).toFixed(digits);
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${sign}${abs}%`;
}

function formatShares(value: number) {
  return `${value.toFixed(2)}`;
}

function binaryMarketHref(
  slug: string,
  lang: UiLang,
  options?: {
    side?: 'yes' | 'no';
    action?: 'buy' | 'sell';
    sellPreset?: '25' | '50' | 'max';
  }
) {
  const params = new URLSearchParams();
  if (lang === 'el') params.set('lang', 'el');
  if (options?.side) params.set('side', options.side);
  if (options?.action) params.set('action', options.action);
  if (options?.sellPreset) params.set('sellPreset', options.sellPreset);
  const query = params.toString();
  return `/markets/${slug}${query ? `?${query}` : ''}`;
}

function categoricalEventHref(slug: string, lang: UiLang, outcomeId?: string) {
  const params = new URLSearchParams();
  if (lang === 'el') params.set('lang', 'el');
  if (outcomeId) params.set('outcome', outcomeId);
  const query = params.toString();
  return `/categorical/${slug}${query ? `?${query}` : ''}`;
}

function historyResultLabel(result: 'won' | 'lost' | 'void' | 'flat', lang: UiLang) {
  if (result === 'won') return tr(lang, 'Won', 'Κέρδισε');
  if (result === 'lost') return tr(lang, 'Lost', 'Έχασε');
  if (result === 'void') return tr(lang, 'Void', 'Άκυρο');
  return tr(lang, 'Flat', 'Ουδέτερο');
}

function resolutionLabel(outcome: 'yes' | 'no' | 'void' | null, lang: UiLang) {
  if (outcome === 'yes') return localizedOutcomeLabel('yes', 'yes', lang);
  if (outcome === 'no') return localizedOutcomeLabel('no', 'no', lang);
  if (outcome === 'void') return tr(lang, 'Void', 'Άκυρο');
  return '—';
}

const MIN_SPAN_BY_RANGE: Record<PortfolioRange, number> = {
  '1D': 50,
  '7D': 100,
  '1M': 250,
  'YTD': 350,
  'ALL': 350
};

function rangeButtonLabel(range: PortfolioRange, lang: UiLang) {
  if (range === '7D') return '1W';
  if (range === 'ALL') return tr(lang, 'All', 'All');
  return range;
}

function rangePerformanceLabel(range: PortfolioRange, lang: UiLang) {
  if (range === 'ALL') return tr(lang, 'All', 'Όλα');
  return rangeButtonLabel(range, lang);
}

function formatAxisMoney(value: number, lang: UiLang) {
  return new Intl.NumberFormat(lang === 'el' ? 'el-GR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(Math.ceil(value));
}

function formatChartTick(value: string | undefined, lang: UiLang, range: PortfolioRange) {
  if (!value) return '—';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '—';

  if (range === '1D') {
    return date.toLocaleTimeString(lang === 'el' ? 'el-GR' : 'en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return date.toLocaleDateString(lang === 'el' ? 'el-GR' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function formatTooltipDate(value: string, lang: UiLang) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '—';

  return date.toLocaleString(lang === 'el' ? 'el-GR' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function historyTimeParts(value: string, lang: UiLang) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return { date: '—', time: '—' };
  }

  return {
    date: date.toLocaleDateString(lang === 'el' ? 'el-GR' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }),
    time: date.toLocaleTimeString(lang === 'el' ? 'el-GR' : 'en-GB', {
      hour: 'numeric',
      minute: '2-digit'
    })
  };
}

function getPaddedMoneyDomain(values: number[]): [number, number] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const rawSpread = max - min;
  const spread = Math.max(rawSpread, max * 0.02, 50);
  const pad = spread * 0.12;
  return [Math.max(0, min - pad), max + pad];
}

function getNiceMoneyStep(roughStep: number) {
  if (!Number.isFinite(roughStep) || roughStep <= 0) return 50;
  const exponent = Math.floor(Math.log10(roughStep));
  const magnitude = 10 ** exponent;
  const normalized = roughStep / magnitude;
  if (normalized <= 1) return magnitude;
  if (normalized <= 2) return 2 * magnitude;
  if (normalized <= 2.5) return 2.5 * magnitude;
  if (normalized <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

function buildMoneyAxis(values: number[], currentPortfolioValue: number) {
  if (!values.length) {
    return {
      domain: [0, 1] as [number, number],
      ticks: [] as number[]
    };
  }

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const anchorValue = Number.isFinite(currentPortfolioValue) && currentPortfolioValue > 0
    ? currentPortfolioValue
    : values[values.length - 1] ?? maxValue;
  const step = getNiceMoneyStep(Math.max(anchorValue, 1) / 6);

  let low = Math.max(0, Math.floor((anchorValue - step * 0.8) / step) * step);
  let high = low + step * 3;

  if (minValue < low) {
    const shiftDownSteps = Math.ceil((low - minValue) / step);
    low = Math.max(0, low - shiftDownSteps * step);
    high = low + step * 3;
  }

  if (maxValue > high) {
    const shiftUpSteps = Math.ceil((maxValue - high) / step);
    low += shiftUpSteps * step;
    high += shiftUpSteps * step;
  }

  return {
    domain: [low, high] as [number, number],
    ticks: [low, low + step, low + step * 2, high]
  };
}

function positionTone(value: number) {
  if (value > 0) return 'portfolioPnlUp';
  if (value < 0) return 'portfolioPnlDown';
  return '';
}

function directionToneClass(tone: PositionRow['positionTone']) {
  if (tone === 'yes') return 'portfolioV2DirectionBadge portfolioV2DirectionBadgeYes';
  if (tone === 'no') return 'portfolioV2DirectionBadge portfolioV2DirectionBadgeNo';
  return 'portfolioV2DirectionBadge portfolioV2DirectionBadgeNeutral';
}

function PortfolioHeroChart({
  points,
  currentPortfolioValue,
  lang,
  range,
  placeholder,
  isLoading
}: {
  points: ChartPoint[];
  currentPortfolioValue: number;
  lang: UiLang;
  range: PortfolioRange;
  placeholder: string;
  isLoading?: boolean;
}) {
  const values = points.map((point) => point.value);
  const axisConfig = useMemo(() => {
    if (!values.length) {
      return {
        domain: [0, 1] as [number, number],
        ticks: [] as number[]
      };
    }

    const stableAxis = buildMoneyAxis(values, currentPortfolioValue);
    const rangeMinSpan = MIN_SPAN_BY_RANGE[range];
    const [domainMin, domainMax] = stableAxis.domain;
    const currentSpan = domainMax - domainMin;

    if (currentSpan >= rangeMinSpan) return stableAxis;

    const extra = (rangeMinSpan - currentSpan) / 2;
    const expandedMin = Math.max(0, domainMin - extra);
    return {
      domain: [expandedMin, expandedMin + rangeMinSpan] as [number, number],
      ticks: stableAxis.ticks
    };
  }, [currentPortfolioValue, range, values]);
  const chartType = points.length >= 24 ? 'monotoneX' : 'linear';
  const xTicks = useMemo(() => {
    if (!points.length) return [] as string[];
    const first = points[0]?.timestamp;
    const last = points[points.length - 1]?.timestamp;
    return first && last && first !== last ? [first, last] : first ? [first] : [];
  }, [points]);

  if (points.length < 2) {
    return (
      <div className="portfolioV2ChartEmpty">
        <strong>{tr(lang, 'Portfolio value chart', 'Γράφημα αξίας χαρτοφυλακίου')}</strong>
        <p>{placeholder}</p>
      </div>
    );
  }

  return (
    <div className={isLoading ? 'portfolioV2ChartStage portfolioV2ChartStageLoading' : 'portfolioV2ChartStage'}>
      <ResponsiveContainer width="100%" height={286}>
        <AreaChart data={points} margin={{ top: 16, right: 18, bottom: 22, left: 0 }}>
          <defs>
            <linearGradient id="portfolioHeroAreaFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#55c8ff" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#55c8ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            axisLine={false}
            dataKey="timestamp"
            interval={0}
            tick={{ fill: 'rgba(148, 163, 184, 0.82)', fontSize: 11 }}
            tickFormatter={(value) => formatChartTick(value, lang, range)}
            tickLine={false}
            ticks={xTicks}
          />
          <YAxis
            axisLine={false}
            domain={axisConfig.domain}
            orientation="left"
            tick={{ fill: 'rgba(148, 163, 184, 0.82)', fontSize: 11 }}
            tickFormatter={(value: number) => formatAxisMoney(value, lang)}
            tickLine={false}
            ticks={axisConfig.ticks}
            width={72}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const rawValue = payload[0]?.value;
              const numericValue = typeof rawValue === 'number' ? rawValue : Number(rawValue ?? 0);

              return (
                <div className="portfolioV2ChartTooltip">
                  <span>{formatTooltipDate(String(label ?? ''), lang)}</span>
                  <strong>{formatEur(numericValue, lang)}</strong>
                </div>
              );
            }}
            cursor={{ stroke: 'rgba(148, 163, 184, 0.18)', strokeDasharray: '2 8' }}
          />
          <Area
            activeDot={{ fill: '#7ed7ff', r: 3, stroke: '#0f1728', strokeWidth: 1.25 }}
            dataKey="value"
            dot={false}
            fill="url(#portfolioHeroAreaFill)"
            isAnimationActive={false}
            stroke="#59c8ff"
            strokeWidth={2}
            type={chartType}
          />
        </AreaChart>
      </ResponsiveContainer>
      {isLoading ? <div className="portfolioV2ChartOverlay">{tr(lang, 'Updating history…', 'Ενημέρωση ιστορικού…')}</div> : null}
    </div>
  );
}

function DesktopPositionTable({
  lang,
  rows,
  mode
}: {
  lang: UiLang;
  rows: PositionRow[];
  mode: 'positions' | 'open';
}) {
  return (
    <div className="portfolioV2Table desktopOnly">
      <div className={`portfolioV2TableHead ${mode === 'positions' ? 'portfolioV2PositionsHead' : 'portfolioV2OpenHead'}`}>
        <span>{tr(lang, 'Market / Contract', 'Αγορά / Συμβόλαιο')}</span>
        <span>{tr(lang, 'Direction', 'Κατεύθυνση')}</span>
        <span>{tr(lang, 'Quantity', 'Ποσότητα')}</span>
        <span>{tr(lang, 'Average price', 'Μέση τιμή')}</span>
        <span>{tr(lang, 'Current price', 'Τρέχουσα τιμή')}</span>
        <span>{tr(lang, 'Unrealized P/L', 'Μη πραγματ. P/L')}</span>
        <span>{tr(lang, 'Position value', 'Αξία θέσης')}</span>
        <span>{tr(lang, 'Actions', 'Ενέργειες')}</span>
      </div>

      {rows.map((row) => (
        <div className={`portfolioV2TableRow ${mode === 'positions' ? 'portfolioV2PositionsHead' : 'portfolioV2OpenHead'}`} key={row.id}>
          <div className="portfolioV2MarketCell">
            <strong>{row.question}</strong>
            <span>{row.marketMeta}</span>
          </div>
          <div className="portfolioV2DirectionCell">
            <span className={directionToneClass(row.positionTone)}>{row.positionLabel}</span>
          </div>
          <span className="portfolioV2NumericCell">{Math.round(row.sharesValue)}</span>
          <span className="portfolioV2NumericCell">{formatProbability(row.avgEntryPrice)}</span>
          <span className="portfolioV2NumericCell">
            <strong>{formatProbability(row.currentPrice)}</strong>
            <span className={positionTone(row.currentChangePct ?? 0)}>{formatSignedPercent(row.currentChangePct, 2)}</span>
          </span>
          <span className={`portfolioV2NumericCell ${positionTone(row.unrealizedPnl)}`}>
            <strong>{formatSignedMoney(row.unrealizedPnl, lang)}</strong>
            <span>{formatSignedPercent(row.unrealizedPct, 2)}</span>
          </span>
          <span className="portfolioV2NumericCell">
            <strong>{formatEur(row.currentValue, lang)}</strong>
          </span>
          <div className="portfolioV2ActionCell">
            <Link className="button portfolioV2Action portfolioV2ActionPrimary" href={row.tradeHref}>
              {tr(lang, 'Trade', 'Συναλλαγή')}
            </Link>
            <Link className="button buttonGhost portfolioV2Action" href={row.href}>
              {tr(lang, 'View', 'Προβολή')}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

function MobilePositionCards({
  lang,
  rows
}: {
  lang: UiLang;
  rows: PositionRow[];
}) {
  return (
    <div className="portfolioV2CardList mobileOnly">
      {rows.map((row) => (
        <article className="portfolioV2MobileCard" key={row.id}>
          <div className="portfolioV2MobileTop">
            <div>
              <strong>{row.positionLabel}</strong>
              <h4>{row.question}</h4>
            </div>
            <span className="badgeNeutral">{localizedMarketStatus(row.status, lang)}</span>
          </div>

          <p className="portfolioV2MobileMeta">{row.marketMeta}</p>

          <div className="portfolioV2MiniGrid">
            <div>
              <span>{tr(lang, 'Current', 'Τρέχουσα')}</span>
              <strong>{formatProbability(row.currentPrice)}</strong>
            </div>
            <div>
              <span>{tr(lang, 'Avg', 'Μ. είσοδος')}</span>
              <strong>{formatProbability(row.avgEntryPrice)}</strong>
            </div>
            <div>
              <span>{tr(lang, 'Value', 'Αξία')}</span>
              <strong>{formatEur(row.currentValue, lang)}</strong>
            </div>
            <div>
              <span>P/L</span>
              <strong className={positionTone(row.unrealizedPnl)}>{formatSignedMoney(row.unrealizedPnl, lang)}</strong>
            </div>
          </div>

          <div className="portfolioV2MobileActions">
            <Link className="button buttonGhost" href={row.href}>
              {tr(lang, 'View', 'Προβολή')}
            </Link>
            <Link className="button buttonGhost" href={row.tradeHref}>
              {tr(lang, 'Trade', 'Συναλλαγή')}
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

function DesktopHistoryTable({
  lang,
  rows
}: {
  lang: UiLang;
  rows: HistoryRow[];
}) {
  return (
    <div className="portfolioV2Table desktopOnly">
      <div className="portfolioV2TableHead portfolioV2HistoryHead">
        <span>{tr(lang, 'Market', 'Αγορά')}</span>
        <span>{tr(lang, 'Detail', 'Λεπτομέρεια')}</span>
        <span>{tr(lang, 'Amount', 'Ποσό')}</span>
        <span>{tr(lang, 'Type', 'Τύπος')}</span>
        <span>{tr(lang, 'Time', 'Χρόνος')}</span>
      </div>
      {rows.map((row) => {
        const time = historyTimeParts(row.createdAt, lang);
        const content = (
          <>
            <div className="portfolioV2MarketCell">
              <strong>{row.title}</strong>
              <span>{row.subtitle}</span>
            </div>
            <div className="portfolioV2MarketCell">
              <strong>{row.detailPrimary}</strong>
              <span>{row.detailSecondary}</span>
            </div>
            <span className={`portfolioV2NumericCell ${positionTone(row.amount)}`}>{row.amountLabel}</span>
            <span className="portfolioV2TypeCell">
              <span className="portfolioV2TypeBadge" title={row.typeTitle}>
                {row.typeLabel}
              </span>
            </span>
            <span className="portfolioV2TimeCell">
              <strong>{time.date}</strong>
              <span>{time.time}</span>
            </span>
          </>
        );

        if (!row.href) {
          return (
            <div className="portfolioV2TableRow portfolioV2HistoryHead" key={row.id}>
              {content}
            </div>
          );
        }

        return (
          <Link className="portfolioV2TableRow portfolioV2HistoryHead portfolioV2RowLink" href={row.href} key={row.id}>
            {content}
          </Link>
        );
      })}
    </div>
  );
}

function MobileHistoryCards({
  lang,
  rows
}: {
  lang: UiLang;
  rows: HistoryRow[];
}) {
  return (
    <div className="portfolioV2CardList mobileOnly">
      {rows.map((row) => {
        const card = (
          <article className="portfolioV2MobileCard">
            <div className="portfolioV2MobileTop">
              <div>
                <strong>{row.title}</strong>
                <h4>{row.detailPrimary}</h4>
              </div>
              <span className={positionTone(row.amount)}>{row.amountLabel}</span>
            </div>
            <p className="portfolioV2MobileMeta">{row.subtitle}</p>
            <div className="portfolioV2MiniGrid">
              <div>
                <span>{tr(lang, 'Type', 'Τύπος')}</span>
                <strong>{row.typeLabel}</strong>
              </div>
              <div>
                <span>{tr(lang, 'Time', 'Χρόνος')}</span>
                <strong>{historyTimeParts(row.createdAt, lang).date}</strong>
                <span>{historyTimeParts(row.createdAt, lang).time}</span>
              </div>
            </div>
          </article>
        );

        return row.href ? (
          <Link className="portfolioV2CardLink" href={row.href} key={row.id}>
            {card}
          </Link>
        ) : (
          <div key={row.id}>{card}</div>
        );
      })}
    </div>
  );
}

export function PortfolioV2Panel({ lang = 'en' }: { lang?: UiLang }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const range = parseRange(searchParams.get('range'));
  const activeTab = parseTab(searchParams.get('tab'));
  const historyFilter = parseHistoryFilter(searchParams.get('filter'));

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioPayload | null>(null);
  const [tradeHistory, setTradeHistory] = useState<TradeHistoryPayload | null>(null);
  const [performance, setPerformance] = useState<PerformancePayload | null>(null);
  const [categorical, setCategorical] = useState<CategoricalPayload | null>(null);
  const [categoricalTrades, setCategoricalTrades] = useState<CategoricalTradeHistoryPayload | null>(null);

  function replaceQuery(next: Partial<{ range: PortfolioRange; tab: PortfolioTab; filter: HistoryFilter }>) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.range) params.set('range', next.range.toLowerCase());
    if (next.tab) params.set('tab', next.tab);
    if (next.filter) params.set('filter', next.filter);
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  async function refresh(background = false) {
    if (background || !loading) {
      setRefreshing(true);
    }

    try {
      const portfolioUrl = lang === 'el' ? '/api/portfolio/summary?lang=el' : '/api/portfolio/summary';
      const tradeHistoryUrl = lang === 'el' ? '/api/trades/history?limit=100&lang=el' : '/api/trades/history?limit=100';
      const performanceParams = new URLSearchParams();
      performanceParams.set('range', range.toLowerCase());
      if (lang === 'el') performanceParams.set('lang', 'el');
      const performanceUrl = `/api/portfolio/performance?${performanceParams.toString()}`;
      const categoricalUrl = lang === 'el' ? '/api/categorical/portfolio/summary?lang=el' : '/api/categorical/portfolio/summary';
      const categoricalTradeUrl = lang === 'el' ? '/api/categorical/trades/history?limit=100&lang=el' : '/api/categorical/trades/history?limit=100';

      const [portfolioRes, tradeHistoryRes, performanceRes, categoricalRes, categoricalTradeRes] = await Promise.all([
        fetch(portfolioUrl, { cache: 'no-store' }),
        fetch(tradeHistoryUrl, { cache: 'no-store' }),
        fetch(performanceUrl, { cache: 'no-store' }),
        fetch(categoricalUrl, { cache: 'no-store' }),
        fetch(categoricalTradeUrl, { cache: 'no-store' })
      ]);

      const [portfolioPayload, tradeHistoryPayload, performancePayload, categoricalPayload, categoricalTradePayload] = await Promise.all([
        readJsonSafely<PortfolioPayload>(portfolioRes),
        readJsonSafely<TradeHistoryPayload>(tradeHistoryRes),
        readJsonSafely<PerformancePayload>(performanceRes),
        readJsonSafely<CategoricalPayload>(categoricalRes),
        readJsonSafely<CategoricalTradeHistoryPayload>(categoricalTradeRes)
      ]);
      const categoricalUnavailable = categoricalRes.status === 404;
      const categoricalTradeUnavailable = categoricalTradeRes.status === 404;

      if (!portfolioRes.ok) {
        throw new Error(portfolioPayload?.error ?? `portfolio request failed (${portfolioRes.status})`);
      }
      if (!tradeHistoryRes.ok) {
        throw new Error(tradeHistoryPayload?.error ?? `trade history request failed (${tradeHistoryRes.status})`);
      }
      if (!performanceRes.ok) {
        throw new Error(performancePayload?.error ?? `performance request failed (${performanceRes.status})`);
      }
      if (!categoricalRes.ok && !categoricalUnavailable) {
        throw new Error(categoricalPayload?.error ?? `categorical portfolio request failed (${categoricalRes.status})`);
      }
      if (!categoricalTradeRes.ok && !categoricalTradeUnavailable) {
        throw new Error(categoricalTradePayload?.error ?? `categorical trade history request failed (${categoricalTradeRes.status})`);
      }

      if (!portfolioPayload) {
        throw new Error('portfolio summary returned a non-JSON response');
      }
      if (!tradeHistoryPayload) {
        throw new Error('trade history returned a non-JSON response');
      }
      if (!performancePayload) {
        throw new Error('portfolio performance returned a non-JSON response');
      }
      if (!categoricalUnavailable && !categoricalPayload) {
        throw new Error('categorical portfolio returned a non-JSON response');
      }
      if (!categoricalTradeUnavailable && !categoricalTradePayload) {
        throw new Error('categorical trade history returned a non-JSON response');
      }

      setPortfolio(portfolioPayload);
      setTradeHistory(tradeHistoryPayload);
      setPerformance(performancePayload);
      setCategorical(
        categoricalUnavailable
          ? { openEvents: [], history: [] }
          : categoricalPayload
      );
      setCategoricalTrades(
        categoricalTradeUnavailable
          ? { trades: [] }
          : categoricalTradePayload
      );
      setError(null);
    } catch (refreshError) {
      const message = refreshError instanceof Error ? refreshError.message : 'portfolio refresh failed';
      setError(message);
      if (!background) {
        setPortfolio(null);
        setTradeHistory(null);
        setPerformance(null);
        setCategorical(null);
        setCategoricalTrades(null);
      }
      captureEvent('portfolio_error_shown', {
        lang,
        range,
        tab: activeTab,
        filter: historyFilter,
        message
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => {
      void refresh(true);
    }, 15_000);
    return () => window.clearInterval(timer);
  }, [lang, range]);

  useEffect(() => {
    if (!loading && !error) {
      captureEvent('portfolio_viewed', {
        lang,
        range,
        tab: activeTab,
        filter: historyFilter
      });
    }
  }, [activeTab, error, historyFilter, lang, loading, range]);

  const categoricalPositionsValue = useMemo(
    () => (categorical?.openEvents ?? []).reduce((sum, event) => sum + event.marketValue, 0),
    [categorical?.openEvents]
  );
  const categoricalUnrealized = useMemo(
    () => (categorical?.openEvents ?? []).reduce((sum, event) => sum + event.unrealizedPnl, 0),
    [categorical?.openEvents]
  );

  const summary = useMemo(() => {
    const startingBalance = portfolio?.wallet?.startingBalance ?? 0;
    const availableToTrade = portfolio?.wallet?.availableBalance ?? 0;
    const positionsValue = (portfolio?.totals?.marketValue ?? 0) + categoricalPositionsValue;
    const realizedPnl = portfolio?.wallet?.realizedPnl ?? 0;
    const unrealizedPnl = (portfolio?.totals?.unrealizedPnl ?? 0) + categoricalUnrealized;
    const totalPnl = realizedPnl + unrealizedPnl;
    return {
      startingBalance,
      availableToTrade,
      positionsValue,
      realizedPnl,
      unrealizedPnl,
      totalPnl,
      totalPnlPct: startingBalance > 0 ? totalPnl / startingBalance : null,
      portfolioValue: availableToTrade + positionsValue
    };
  }, [categoricalPositionsValue, categoricalUnrealized, portfolio?.totals?.marketValue, portfolio?.totals?.unrealizedPnl, portfolio?.wallet?.availableBalance, portfolio?.wallet?.realizedPnl, portfolio?.wallet?.startingBalance]);

  const positionRows = useMemo(() => {
    const rows: PositionRow[] = [];

    for (const entry of portfolio?.positions ?? []) {
      if (!entry.market || !entry.pricing) continue;

      if (entry.position.yesShares > 0 || entry.position.yesCostBasis > 0) {
        const avgEntryPrice = entry.position.yesShares > 0 ? entry.position.yesCostBasis / entry.position.yesShares : null;
        rows.push({
          id: `binary:${entry.marketId}:yes`,
          marketType: 'binary',
          href: binaryMarketHref(entry.market.slug, lang, { side: 'yes' }),
          tradeHref: binaryMarketHref(entry.market.slug, lang, { side: 'yes', action: 'buy' }),
          question: localizedQuestionFromSlug(entry.market.slug, entry.market.question, lang),
          category: entry.market.category,
          status: entry.market.status,
          closeTime: entry.market.closeTime ?? null,
          positionLabel: localizedOutcomeLabel('yes', 'yes', lang),
          sharesLabel: `${formatShares(entry.position.yesShares)} ${tr(lang, 'shares', 'shares')}`,
          sharesValue: entry.position.yesShares,
          avgEntryPrice,
          currentPrice: entry.pricing.yesPrice,
          currentChangePct: avgEntryPrice && avgEntryPrice > 0 ? entry.pricing.yesPrice / avgEntryPrice - 1 : null,
          currentValue: entry.position.yesShares * entry.pricing.yesPrice,
          unrealizedPnl: entry.position.yesShares * entry.pricing.yesPrice - entry.position.yesCostBasis,
          unrealizedPct: entry.position.yesCostBasis > 0 ? (entry.position.yesShares * entry.pricing.yesPrice - entry.position.yesCostBasis) / entry.position.yesCostBasis : null,
          positionTone: 'yes',
          marketMeta: localizedOutcomeLabel('yes', 'yes', lang)
        });
      }

      if (entry.position.noShares > 0 || entry.position.noCostBasis > 0) {
        const avgEntryPrice = entry.position.noShares > 0 ? entry.position.noCostBasis / entry.position.noShares : null;
        rows.push({
          id: `binary:${entry.marketId}:no`,
          marketType: 'binary',
          href: binaryMarketHref(entry.market.slug, lang, { side: 'no' }),
          tradeHref: binaryMarketHref(entry.market.slug, lang, { side: 'no', action: 'buy' }),
          question: localizedQuestionFromSlug(entry.market.slug, entry.market.question, lang),
          category: entry.market.category,
          status: entry.market.status,
          closeTime: entry.market.closeTime ?? null,
          positionLabel: localizedOutcomeLabel('no', 'no', lang),
          sharesLabel: `${formatShares(entry.position.noShares)} ${tr(lang, 'shares', 'shares')}`,
          sharesValue: entry.position.noShares,
          avgEntryPrice,
          currentPrice: entry.pricing.noPrice,
          currentChangePct: avgEntryPrice && avgEntryPrice > 0 ? entry.pricing.noPrice / avgEntryPrice - 1 : null,
          currentValue: entry.position.noShares * entry.pricing.noPrice,
          unrealizedPnl: entry.position.noShares * entry.pricing.noPrice - entry.position.noCostBasis,
          unrealizedPct: entry.position.noCostBasis > 0 ? (entry.position.noShares * entry.pricing.noPrice - entry.position.noCostBasis) / entry.position.noCostBasis : null,
          positionTone: 'no',
          marketMeta: localizedOutcomeLabel('no', 'no', lang)
        });
      }
    }

    for (const event of categorical?.openEvents ?? []) {
      for (const outcome of event.outcomes) {
        if (outcome.shares <= 0 && outcome.costBasis <= 0) continue;
        rows.push({
          id: `categorical:${event.eventId}:${outcome.outcomeId}`,
          marketType: 'categorical',
          href: categoricalEventHref(event.event.slug, lang, outcome.outcomeId),
          tradeHref: categoricalEventHref(event.event.slug, lang, outcome.outcomeId),
          question: event.event.title,
          category: event.event.category,
          status: event.event.status,
          closeTime: event.event.closeTime,
          positionLabel: outcome.label,
          sharesLabel: `${formatShares(outcome.shares)} ${tr(lang, 'shares', 'shares')}`,
          sharesValue: outcome.shares,
          avgEntryPrice: outcome.shares > 0 ? outcome.costBasis / outcome.shares : null,
          currentPrice: outcome.probability,
          currentChangePct: outcome.shares > 0 && outcome.costBasis > 0 ? outcome.probability / (outcome.costBasis / outcome.shares) - 1 : null,
          currentValue: outcome.marketValue,
          unrealizedPnl: outcome.unrealizedPnl,
          unrealizedPct: outcome.costBasis > 0 ? outcome.unrealizedPnl / outcome.costBasis : null,
          positionTone: 'neutral',
          marketMeta: outcome.label
        });
      }
    }

    return rows.sort((left, right) => {
      const leftAbs = Math.abs(left.unrealizedPnl);
      const rightAbs = Math.abs(right.unrealizedPnl);
      if (rightAbs !== leftAbs) return rightAbs - leftAbs;
      return right.currentValue - left.currentValue;
    });
  }, [categorical?.openEvents, lang, portfolio?.positions]);

  const openRows = useMemo(
    () =>
      positionRows
        .filter((row) => row.status === 'open')
        .sort((left, right) => {
          const leftClose = left.closeTime ? new Date(left.closeTime).getTime() : Number.POSITIVE_INFINITY;
          const rightClose = right.closeTime ? new Date(right.closeTime).getTime() : Number.POSITIVE_INFINITY;
          if (leftClose !== rightClose) return leftClose - rightClose;
          return right.currentValue - left.currentValue;
        }),
    [positionRows]
  );

  const binarySettledRows = useMemo(() => {
    const attributionMap = new Map((performance?.attribution ?? []).map((item) => [item.marketId, item]));

    return (portfolio?.history ?? []).map((entry) => {
      const attribution = attributionMap.get(entry.marketId);
      const sideLabel =
        entry.positionSide === 'mixed'
          ? tr(lang, 'Mixed book', 'Μικτή θέση')
          : entry.positionSide === 'yes'
            ? localizedOutcomeLabel('yes', 'yes', lang)
            : localizedOutcomeLabel('no', 'no', lang);

      return {
        id: `settlement:${entry.marketId}:${entry.settledAt}`,
        kind: 'settlement' as const,
        href: binaryMarketHref(entry.market.slug, lang),
        title: entry.market.question,
        subtitle: localizedCategory(entry.market.category, lang),
        amount: entry.realizedPnl,
        amountLabel: formatSignedMoney(entry.realizedPnl, lang),
        typeLabel:
          entry.result === 'won'
            ? tr(lang, 'Payout', 'Πληρωμή')
            : entry.result === 'void'
              ? tr(lang, 'Refund', 'Επιστροφή')
              : tr(lang, 'Expiry', 'Λήξη'),
        typeTitle:
          entry.result === 'won'
            ? tr(lang, 'Settlement payout', 'Πληρωμή διακανονισμού')
            : entry.result === 'void'
              ? tr(lang, 'Void refund', 'Επιστροφή ακύρωσης')
              : tr(lang, 'Settlement expiry', 'Λήξη χωρίς πληρωμή'),
        detailPrimary: `${historyResultLabel(entry.result, lang)} · ${resolutionLabel(entry.resolutionOutcome, lang)}`,
        detailSecondary: attribution?.returnPct != null ? formatSignedPercent(attribution.returnPct / 100, 1) : sideLabel,
        createdAt: entry.settledAt
      };
    });
  }, [lang, performance?.attribution, portfolio?.history]);

  const categoricalSettledRows = useMemo(
    () =>
      (categorical?.history ?? []).map((entry) => {
        const resultLabel =
          entry.resolutionType === 'void'
            ? tr(lang, 'Void', 'Άκυρο')
            : entry.realizedDelta > 0
              ? tr(lang, 'Won', 'Κέρδισε')
              : entry.realizedDelta < 0
                ? tr(lang, 'Lost', 'Έχασε')
                : tr(lang, 'Flat', 'Ουδέτερο');
        const returnPct = entry.totalCostBasisClosed > 0 ? entry.realizedDelta / entry.totalCostBasisClosed : null;

        return {
          id: `categorical:settlement:${entry.eventId}:${entry.settledAt}`,
          kind: 'settlement' as const,
          href: categoricalEventHref(entry.event.slug, lang),
          title: entry.event.title,
          subtitle: localizedCategory(entry.event.category, lang),
          amount: entry.realizedDelta,
          amountLabel: formatSignedMoney(entry.realizedDelta, lang),
          typeLabel:
            entry.resolutionType === 'void'
              ? tr(lang, 'Refund', 'Επιστροφή')
              : entry.realizedDelta > 0
                ? tr(lang, 'Payout', 'Πληρωμή')
                : tr(lang, 'Expiry', 'Λήξη'),
          typeTitle:
            entry.resolutionType === 'void'
              ? tr(lang, 'Void refund', 'Επιστροφή ακύρωσης')
              : entry.realizedDelta > 0
                ? tr(lang, 'Settlement payout', 'Πληρωμή διακανονισμού')
                : tr(lang, 'Settlement expiry', 'Λήξη χωρίς πληρωμή'),
          detailPrimary:
            entry.resolutionType === 'void'
              ? tr(lang, 'Voided event', 'Ακυρωμένο γεγονός')
              : `${resultLabel} · ${entry.winningOutcomeLabel ?? tr(lang, 'Winner', 'Νικητής')}`,
          detailSecondary: returnPct != null ? formatSignedPercent(returnPct, 1) : tr(lang, 'Settled', 'Διακανονισμένο'),
          createdAt: entry.settledAt
        };
      }),
    [categorical?.history, lang]
  );

  const tradeRows = useMemo(
    () =>
      [
        ...(tradeHistory?.trades ?? []).map((entry) => {
          const cashFlow = entry.action === 'buy' ? -Math.abs(entry.netAmount) : Math.abs(entry.netAmount);
          const sideLabel = entry.side === 'yes' ? localizedOutcomeLabel('yes', 'yes', lang) : localizedOutcomeLabel('no', 'no', lang);
          return {
            id: `trade:${entry.id}`,
            kind: 'trade' as const,
            href: entry.market?.slug ? binaryMarketHref(entry.market.slug, lang, { side: entry.side }) : null,
            title: entry.market?.question ?? tr(lang, 'Trade', 'Συναλλαγή'),
            subtitle: entry.market ? localizedCategory(entry.market.category, lang) : tr(lang, 'Binary market', 'Δυαδική αγορά'),
            amount: cashFlow,
            amountLabel: formatSignedMoney(cashFlow, lang),
            typeLabel: entry.action === 'buy' ? tr(lang, 'Buy', 'Αγορά') : tr(lang, 'Sell', 'Πώληση'),
            typeTitle: entry.action === 'buy' ? tr(lang, 'Position buy', 'Αγορά θέσης') : tr(lang, 'Position sell', 'Πώληση θέσης'),
            detailPrimary: `${entry.action === 'buy' ? tr(lang, 'Buy', 'Αγορά') : tr(lang, 'Sell', 'Πώληση')} ${sideLabel}`,
            detailSecondary: `${formatShares(entry.shareDelta)} ${tr(lang, 'shares', 'shares')} · ${formatProbability(entry.avgPrice)}`,
            createdAt: entry.createdAt
          };
        }),
        ...((categoricalTrades?.trades ?? []).map((entry) => {
          const cashFlow = entry.action === 'buy' ? -Math.abs(entry.netAmount) : Math.abs(entry.netAmount);
          return {
            id: `categorical-trade:${entry.id}`,
            kind: 'trade' as const,
            href: entry.event?.slug ? categoricalEventHref(entry.event.slug, lang) : null,
            title: entry.event?.title ?? tr(lang, 'Categorical trade', 'Κατηγορική συναλλαγή'),
            subtitle: entry.event ? localizedCategory(entry.event.category, lang) : tr(lang, 'Categorical market', 'Κατηγορική αγορά'),
            amount: cashFlow,
            amountLabel: formatSignedMoney(cashFlow, lang),
            typeLabel: entry.action === 'buy' ? tr(lang, 'Buy', 'Αγορά') : tr(lang, 'Sell', 'Πώληση'),
            typeTitle: entry.action === 'buy' ? tr(lang, 'Position buy', 'Αγορά θέσης') : tr(lang, 'Position sell', 'Πώληση θέσης'),
            detailPrimary: `${entry.action === 'buy' ? tr(lang, 'Buy', 'Αγορά') : tr(lang, 'Sell', 'Πώληση')} ${entry.outcomeLabel}`,
            detailSecondary: `${formatShares(entry.shareDelta)} ${tr(lang, 'shares', 'shares')} · ${formatProbability(entry.avgPrice)}`,
            createdAt: entry.createdAt
          };
        }) ?? [])
      ].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()),
    [categoricalTrades?.trades, lang, tradeHistory?.trades]
  );

  const cashRows = useMemo(
    () =>
      (performance?.activity?.entries ?? [])
        .filter((entry) => entry.entryType === 'seed' || entry.entryType === 'manual_adjustment')
        .map((entry) => ({
          id: `cash:${entry.id}`,
          kind: 'cash' as const,
          href: null,
          title: entry.label,
          subtitle: entry.detail ?? tr(lang, 'Wallet activity', 'Δραστηριότητα πορτοφολιού'),
          amount: entry.amount,
          amountLabel: formatSignedMoney(entry.amount, lang),
          typeLabel: tr(lang, 'Cash', 'Ταμείο'),
          typeTitle: tr(lang, 'Cash movement', 'Ταμειακή κίνηση'),
          detailPrimary: `${tr(lang, 'Balance after', 'Υπόλοιπο μετά')} ${formatEur(entry.balanceAfter, lang)}`,
          detailSecondary: entry.detailSecondary ?? tr(lang, 'Cash movement', 'Ταμειακή κίνηση'),
          createdAt: entry.createdAt
        })),
    [lang, performance?.activity?.entries]
  );

  const settledRows = useMemo(
    () => [...binarySettledRows, ...categoricalSettledRows].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()),
    [binarySettledRows, categoricalSettledRows]
  );

  const historyRows = useMemo(() => {
    if (historyFilter === 'settled') return settledRows;
    if (historyFilter === 'trades') return tradeRows;
    if (historyFilter === 'cash') return cashRows;

    return [...settledRows, ...tradeRows, ...cashRows].sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );
  }, [cashRows, historyFilter, settledRows, tradeRows]);

  const chartPoints = useMemo(() => performance?.chart ?? [], [performance?.chart]);

  const rangePnl = useMemo(
    () => ({
      label: rangePerformanceLabel(performance?.selectedRange ?? range, lang),
      amount: performance?.selectedRangePnl?.pnlAmount ?? summary.totalPnl,
      pct: performance?.selectedRangePnl?.pnlPct ?? summary.totalPnlPct
    }),
    [lang, performance?.selectedRange, performance?.selectedRangePnl?.pnlAmount, performance?.selectedRangePnl?.pnlPct, range, summary.totalPnl, summary.totalPnlPct]
  );

  if (loading) {
    return (
      <section className="card">
        <p className="subtle">{tr(lang, 'Loading portfolio...', 'Φόρτωση χαρτοφυλακίου...')}</p>
      </section>
    );
  }

  if (error || !portfolio || !performance || !categorical) {
    return (
      <section className="card stackSm">
        <div className="notice noticeWarn">{error ?? tr(lang, 'Portfolio could not be loaded.', 'Δεν ήταν δυνατή η φόρτωση του χαρτοφυλακίου.')}</div>
        <p className="subtle">{tr(lang, 'If this says auth required, sign in through /access first.', 'Αν αναφέρει ότι απαιτείται σύνδεση, μπες πρώτα από το /access.')}</p>
        <div className="buttonRow">
          <button className="button buttonGhost" type="button" onClick={() => void refresh()}>
            {tr(lang, 'Retry', 'Δοκιμή ξανά')}
          </button>
        </div>
      </section>
    );
  }

  const metricItems = [
    {
      id: 'available',
      label: tr(lang, 'Available to trade', 'Διαθέσιμο για συναλλαγές'),
      value: formatEur(summary.availableToTrade, lang),
      tone: 'neutral',
      tooltip: tr(lang, 'Cash balance available for new trades.', 'Ποσό που μπορείς να χρησιμοποιήσεις για νέες συναλλαγές.')
    },
    {
      id: 'positions',
      label: tr(lang, 'In positions', 'Σε θέσεις'),
      value: formatEur(summary.positionsValue, lang),
      tone: 'neutral',
      tooltip: tr(lang, 'Current marked value held in open positions.', 'Τρέχουσα αποτίμηση των ανοιχτών θέσεων.')
    },
    {
      id: 'unrealized',
      label: tr(lang, 'Open P/L', 'Ανοιχτό P/L'),
      value: formatSignedMoney(summary.unrealizedPnl, lang),
      tone: summary.unrealizedPnl >= 0 ? 'positive' : 'negative',
      tooltip: tr(lang, 'Floating profit or loss from positions that are not closed yet.', 'Κέρδος ή ζημία από θέσεις που δεν έχουν κλείσει ακόμη.')
    },
    {
      id: 'realized',
      label: tr(lang, 'Realized P/L', 'Πραγματοποιημένο P/L'),
      value: formatSignedMoney(summary.realizedPnl, lang),
      tone: summary.realizedPnl >= 0 ? 'positive' : 'negative',
      tooltip: tr(lang, 'Profit or loss already locked from sells and settled markets.', 'Κέρδος ή ζημία που έχει ήδη κλειδώσει από πωλήσεις και διακανονισμένες αγορές.')
    }
  ];

  return (
    <section className="portfolioV2 stackMd">
      <section className="card portfolioV2Hero">
        <div className="portfolioV2HeroSummary">
          <div className="portfolioV2ValueBlock portfolioV2HeroSummaryPrimary">
            <p className="portfolioV2HeroEyebrow">{tr(lang, 'Portfolio value', 'ΑΞΙΑ ΧΑΡΤΟΦΥΛΑΚΙΟΥ')}</p>
            <div className="portfolioV2HeroValue">{formatEur(summary.portfolioValue, lang)}</div>
            <div className="portfolioV2HeroDelta">
              <strong className={positionTone(rangePnl.amount)}>{formatSignedMoney(rangePnl.amount, lang)}</strong>
              <strong className={positionTone(rangePnl.amount)}>{formatSignedPercent(rangePnl.pct)}</strong>
              <span>{rangePnl.label}</span>
            </div>
          </div>
          <div className="portfolioV2RangeSelector" role="tablist" aria-label={tr(lang, 'Portfolio time range', 'Χρονικό εύρος χαρτοφυλακίου')}>
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={range === option}
                className={range === option ? 'portfolioV2RangeChip portfolioV2RangeChipActive' : 'portfolioV2RangeChip'}
                onClick={() => {
                  captureEvent('portfolio_range_changed', { lang, range: option, tab: activeTab });
                  replaceQuery({ range: option });
                }}
              >
                {rangeButtonLabel(option, lang)}
              </button>
            ))}
          </div>
        </div>

        <PortfolioHeroChart
          currentPortfolioValue={summary.portfolioValue}
          lang={lang}
          points={chartPoints}
          range={range}
          isLoading={refreshing}
          placeholder={tr(
            lang,
            'Your historical portfolio-value view will fill in as more account snapshots accumulate.',
            'Η ιστορική προβολή της αξίας χαρτοφυλακίου θα γεμίσει όσο συγκεντρώνονται περισσότερα στιγμιότυπα.'
          )}
        />
        <div className="portfolioV2HeroMetrics">
          {metricItems.map((item) => (
            <div className="portfolioV2HeroMetric" key={item.id} title={item.tooltip}>
              <span className="portfolioV2SummaryLabel">{item.label}</span>
              <strong className={item.tone === 'positive' ? 'portfolioPnlUp' : item.tone === 'negative' ? 'portfolioPnlDown' : ''}>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="card portfolioV2PanelCard">
        <div className="portfolioV2Tabs" role="tablist" aria-label={tr(lang, 'Portfolio sections', 'Ενότητες χαρτοφυλακίου')}>
          {(['positions', 'open', 'history'] as PortfolioTab[]).map((tab) => (
            <button
              type="button"
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              className={activeTab === tab ? 'portfolioV2Tab portfolioV2TabActive' : 'portfolioV2Tab'}
              onClick={() => {
                captureEvent('portfolio_tab_changed', { lang, range, tab });
                replaceQuery({ tab });
              }}
            >
              {tab === 'positions'
                ? tr(lang, 'Positions', 'Θέσεις')
                : tab === 'open'
                  ? tr(lang, 'Open', 'Ανοιχτά')
                  : tr(lang, 'History', 'Ιστορικό')}
            </button>
          ))}
        </div>

      {activeTab === 'positions' ? (
        <section className="portfolioV2PanelBody stackSm" role="tabpanel">
          {positionRows.length === 0 ? (
            <div className="portfolioV2Empty">
              <strong>{tr(lang, 'No positions yet', 'Δεν έχεις θέσεις ακόμη')}</strong>
              <p>{tr(lang, 'Browse markets and place your first paper trade.', 'Δες τις αγορές και κάνε την πρώτη σου δοκιμαστική συναλλαγή.')}</p>
            </div>
          ) : (
            <>
              <DesktopPositionTable lang={lang} rows={positionRows} mode="positions" />
              <MobilePositionCards lang={lang} rows={positionRows} />
            </>
          )}
        </section>
      ) : null}

      {activeTab === 'open' ? (
        <section className="portfolioV2PanelBody stackSm" role="tabpanel">
          {openRows.length === 0 ? (
            <div className="portfolioV2Empty">
              <strong>{tr(lang, 'No open positions available to trade', 'Δεν υπάρχουν ανοιχτές θέσεις για συναλλαγή')}</strong>
              <p>{tr(lang, 'Your current holdings are either awaiting resolution or already settled.', 'Οι τρέχουσες θέσεις σου είτε περιμένουν επίλυση είτε έχουν ήδη διακανονιστεί.')}</p>
            </div>
          ) : (
            <>
              <DesktopPositionTable lang={lang} rows={openRows} mode="open" />
              <MobilePositionCards lang={lang} rows={openRows} />
            </>
          )}
        </section>
      ) : null}

      {activeTab === 'history' ? (
        <section className="portfolioV2PanelBody stackSm" role="tabpanel">
          {historyRows.length === 0 ? (
            <div className="portfolioV2Empty">
              <strong>{tr(lang, 'No portfolio history yet', 'Δεν υπάρχει ιστορικό ακόμη')}</strong>
              <p>{tr(lang, 'Your trades and settlements will appear here.', 'Οι συναλλαγές και οι διακανονισμοί σου θα εμφανίζονται εδώ.')}</p>
            </div>
          ) : (
            <>
              <DesktopHistoryTable lang={lang} rows={historyRows} />
              <MobileHistoryCards lang={lang} rows={historyRows} />
            </>
          )}
        </section>
      ) : null}
      </section>
    </section>
  );
}
