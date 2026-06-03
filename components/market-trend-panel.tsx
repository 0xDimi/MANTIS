'use client';

import { useEffect, useState } from 'react';
import { formatCompact } from '@/lib/format';
import {
  buildFlatProbabilitySeries,
  getProbabilityChangePp,
  isLowActivityWindow,
  type ProbabilityTrendPoint
} from '@/lib/probability-visuals';
import { tr, type UiLang } from '@/lib/ui-lang';
import { ProbabilityChart } from '@/components/probability-chart';

type MarketTrendPanelProps = {
  slug: string;
  yesPrice: number;
  volumeTotal: number;
  liquidity: number;
  participants: number;
  lang: UiLang;
  yesLabel?: string;
};

type RangeKey = '24h' | '7d' | 'all';

type TrendResponse = {
  range: RangeKey;
  points: Array<ProbabilityTrendPoint>;
  meta?: {
    source?: 'trades' | 'state';
    tradeCount?: number;
    lastTradeTime?: string | null;
  } | null;
};

function fallbackPointCount(range: RangeKey) {
  if (range === 'all') return 18;
  if (range === '7d') return 14;
  return 10;
}

function normalizeTrendPoints(points: Array<ProbabilityTrendPoint> | undefined, anchor: number, range: RangeKey) {
  const normalized = (points ?? []).filter((point) => Number.isFinite(point.yesPrice));

  return normalized.length >= 2 ? normalized : buildFlatProbabilitySeries(anchor, fallbackPointCount(range));
}

function rangeStartLabel(range: RangeKey, lang: UiLang) {
  if (range === '24h') return tr(lang, '24h ago', '24ω πριν');
  if (range === '7d') return tr(lang, '7d ago', '7η πριν');
  return tr(lang, 'Start', 'Αρχή');
}

export function MarketTrendPanel({
  slug,
  yesPrice,
  volumeTotal,
  liquidity,
  participants,
  lang,
  yesLabel = 'YES'
}: MarketTrendPanelProps) {
  const [range, setRange] = useState<RangeKey>('24h');
  const [seriesByRange, setSeriesByRange] = useState<Partial<Record<RangeKey, ProbabilityTrendPoint[]>>>({});
  const [metaByRange, setMetaByRange] = useState<Partial<Record<RangeKey, TrendResponse['meta']>>>({});
  const [loadingRange, setLoadingRange] = useState<RangeKey | null>(null);

  useEffect(() => {
    if (seriesByRange[range]) return;

    let cancelled = false;

    async function loadTrend() {
      setLoadingRange(range);

      try {
        const response = await fetch(`/api/markets/${encodeURIComponent(slug)}/trend?range=${range}`, {
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error(`trend request failed (${response.status})`);
        }

        const payload = (await response.json()) as TrendResponse;

        if (cancelled) return;

        setSeriesByRange((prev) => ({
          ...prev,
          [range]: normalizeTrendPoints(payload.points, yesPrice, range)
        }));

        setMetaByRange((prev) => ({
          ...prev,
          [range]: payload.meta ?? null
        }));
      } catch {
        if (cancelled) return;

        setSeriesByRange((prev) => ({
          ...prev,
          [range]: buildFlatProbabilitySeries(yesPrice, fallbackPointCount(range))
        }));

        setMetaByRange((prev) => ({
          ...prev,
          [range]: {
            source: 'state',
            tradeCount: 0,
            lastTradeTime: null
          }
        }));
      } finally {
        if (!cancelled) {
          setLoadingRange((prev) => (prev === range ? null : prev));
        }
      }
    }

    void loadTrend();

    return () => {
      cancelled = true;
    };
  }, [range, seriesByRange, slug, yesPrice]);

  const series = seriesByRange[range] ?? buildFlatProbabilitySeries(yesPrice, fallbackPointCount(range));
  const rangeMeta = metaByRange[range];
  const tradeCount = Number(rangeMeta?.tradeCount ?? 0);
  const lowActivity = isLowActivityWindow(tradeCount);
  const changePp = getProbabilityChangePp(series);
  const isFlat = Math.abs(changePp) < 0.05;
  const changeLabel = isFlat
    ? tr(lang, 'Stable', 'Σταθερό')
    : `${changePp >= 0 ? '+' : ''}${changePp.toFixed(1)}pp`;

  const ranges: Array<{ key: RangeKey; label: string }> = [
    { key: '24h', label: '24H' },
    { key: '7d', label: '7D' },
    { key: 'all', label: tr(lang, 'ALL', 'ΟΛΑ') }
  ];

  return (
    <section className="marketTrendPanel">
      <div className="marketTrendHead">
        <div className="marketTrendSignal">
          <p className="marketTrendLabel">{tr(lang, 'Forecast', 'Πρόβλεψη')} {yesLabel}</p>
          <p className="marketTrendValue">{Math.round(yesPrice * 100)}%</p>
        </div>

        <div className="marketTrendHeadRight">
          <div className={isFlat ? 'marketTrendDelta' : changePp >= 0 ? 'marketTrendDelta marketTrendDeltaUp' : 'marketTrendDelta marketTrendDeltaDown'}>
            {changeLabel}
          </div>

          <div className="marketTrendRangeTabs" role="tablist" aria-label={tr(lang, 'Time range', 'Χρονικό εύρος')}>
            {ranges.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={range === item.key}
                className={range === item.key ? 'marketTrendRangeButton marketTrendRangeButtonActive' : 'marketTrendRangeButton'}
                onClick={() => setRange(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ProbabilityChart
        chartId={`mantis-probability-chart-${slug}-${range}`}
        points={series}
        currentProbability={series[series.length - 1]?.yesPrice ?? yesPrice}
        lang={lang}
        startLabel={rangeStartLabel(range, lang)}
        endLabel={tr(lang, 'Now', 'Τώρα')}
        loading={loadingRange === range}
      />

      <div className="marketTrendMeta">
        <span>{tr(lang, 'Volume', 'Όγκος')} €{formatCompact(volumeTotal, lang)}</span>
        <span>{tr(lang, 'Liquidity', 'Ρευστότητα')} €{formatCompact(liquidity, lang)}</span>
        <span>{tr(lang, 'Participants', 'Συμμετέχοντες')} {participants}</span>
        <span>{lowActivity ? tr(lang, 'Quiet window', 'Ήρεμο εύρος') : tr(lang, 'Active window', 'Ενεργό εύρος')}</span>
      </div>
    </section>
  );
}
