'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatCompact, formatPercent } from '@/lib/format';
import { tr, type UiLang } from '@/lib/ui-lang';

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
  points: Array<{ time: string; yesPrice: number }>;
  meta?: {
    source?: 'trades' | 'state';
    tradeCount?: number;
  };
};

function clampPrice(value: number) {
  return Math.max(0.02, Math.min(0.98, value || 0.5));
}

function buildFallbackSeries(anchor: number, range: RangeKey) {
  const points = range === 'all' ? 34 : range === '7d' ? 24 : 16;
  const value = clampPrice(anchor);
  return Array.from({ length: points }, () => value);
}

function toPoints(values: number[]) {
  if (!values.length) return [] as Array<{ x: number; y: number }>;

  return values.map((value, index) => {
    const x = values.length === 1 ? 94 : 6 + (index / (values.length - 1)) * 88;
    const y = 8 + (1 - value) * 84;
    return { x, y };
  });
}

function toLinePath(points: Array<{ x: number; y: number }>) {
  if (!points.length) return '';

  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');
}

function toAreaPath(points: Array<{ x: number; y: number }>) {
  if (!points.length) return '';

  const first = points[0];
  const last = points[points.length - 1];
  const line = toLinePath(points);
  return `${line} L ${last.x.toFixed(2)} 92 L ${first.x.toFixed(2)} 92 Z`;
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
  const [seriesByRange, setSeriesByRange] = useState<Partial<Record<RangeKey, number[]>>>({});
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
        const values = (payload.points ?? [])
          .map((point) => clampPrice(Number(point.yesPrice)))
          .filter((value) => Number.isFinite(value));

        if (cancelled) return;

        setSeriesByRange((prev) => ({
          ...prev,
          [range]: values.length >= 2 ? values : buildFallbackSeries(yesPrice, range)
        }));

        setMetaByRange((prev) => ({
          ...prev,
          [range]: payload.meta ?? null
        }));
      } catch {
        if (cancelled) return;

        setSeriesByRange((prev) => ({
          ...prev,
          [range]: buildFallbackSeries(yesPrice, range)
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
  }, [range, slug, yesPrice, seriesByRange]);

  const series = seriesByRange[range] ?? buildFallbackSeries(yesPrice, range);
  const points = useMemo(() => toPoints(series), [series]);
  const linePath = useMemo(() => toLinePath(points), [points]);
  const areaPath = useMemo(() => toAreaPath(points), [points]);
  const latestPoint = points[points.length - 1] ?? { x: 92, y: 50 };
  const changePp = (series[series.length - 1] - series[0]) * 100;
  const isFlat = Math.abs(changePp) < 0.05;
  const changeLabel = isFlat
    ? tr(lang, 'Stable', 'Σταθερό')
    : `${changePp >= 0 ? '+' : ''}${changePp.toFixed(1)}pp`;
  const axisValues = [100, 75, 50, 25, 0];
  const rangeMeta = metaByRange[range];
  const lowActivity = Number(rangeMeta?.tradeCount ?? 0) < 2;

  const ranges: Array<{ key: RangeKey; label: string }> = [
    { key: '24h', label: '24H' },
    { key: '7d', label: '7D' },
    { key: 'all', label: tr(lang, 'ALL', 'ΟΛΑ') }
  ];

  return (
    <section className="marketTrendPanel">
      <div className="marketTrendHead">
        <div>
          <p className="marketTrendLabel">{tr(lang, 'Forecast', 'Πρόβλεψη')} {yesLabel}</p>
          <p className="marketTrendValue">{formatPercent(yesPrice)}</p>
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

      <div className="marketTrendLine" aria-hidden="true">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`mantisTrendArea-${slug}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(56,146,255,0.06)" />
              <stop offset="100%" stopColor="rgba(99,102,241,0)" />
            </linearGradient>
          </defs>

          {axisValues.map((axis) => {
            const y = 10 + (1 - axis / 100) * 80;
            return (
              <line
                key={axis}
                x1="6"
                x2="94"
                y1={y.toFixed(2)}
                y2={y.toFixed(2)}
                stroke="rgba(199, 214, 241, 0.16)"
                strokeDasharray="1 5"
              />
            );
          })}

          <path d={areaPath} fill={`url(#mantisTrendArea-${slug})`} />
          <path d={linePath} stroke="#38a0ff" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round" shapeRendering="geometricPrecision" />
          <circle cx={latestPoint.x.toFixed(2)} cy={latestPoint.y.toFixed(2)} r="1.8" fill="#3aa3ff" />
          <circle cx={latestPoint.x.toFixed(2)} cy={latestPoint.y.toFixed(2)} r="3.9" fill="rgba(58, 163, 255, 0.12)" />
        </svg>

        <div className="marketTrendAxisY">
          {axisValues.map((value) => (
            <span key={value}>{value}%</span>
          ))}
        </div>

        <div className="marketTrendAxisX">
          <span>{range === '24h' ? tr(lang, '24h ago', '24ω πριν') : range === '7d' ? tr(lang, '7d ago', '7η πριν') : tr(lang, 'Start', 'Αρχή')}</span>
          <span>{loadingRange === range ? tr(lang, 'Updating…', 'Ενημέρωση…') : tr(lang, 'Now', 'Τώρα')}</span>
        </div>
      </div>

      {lowActivity ? (
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'rgba(212,220,255,0.66)' }}>
          {tr(lang, 'Low activity in this window, chart uses sparse ticks.', 'Χαμηλή δραστηριότητα σε αυτό το εύρος, το γράφημα έχει αραιά ticks.')}
        </p>
      ) : null}

      <div className="marketTrendMeta">
        <span>{tr(lang, 'Volume', 'Όγκος')} €{formatCompact(volumeTotal, lang)}</span>
        <span>{tr(lang, 'Liquidity', 'Ρευστότητα')} €{formatCompact(liquidity, lang)}</span>
        <span>{tr(lang, 'Participants', 'Συμμετέχοντες')} {participants}</span>
      </div>
    </section>
  );
}
