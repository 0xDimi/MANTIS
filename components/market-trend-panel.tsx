'use client';

import { useMemo, useState } from 'react';
import { formatCompact, formatPercent } from '@/lib/format';
import { tr, type UiLang } from '@/lib/ui-lang';

type MarketTrendPanelProps = {
  slug: string;
  yesPrice: number;
  noPrice: number;
  volumeTotal: number;
  liquidity: number;
  participants: number;
  lang: UiLang;
};

type RangeKey = '24h' | '7d' | 'all';

function hashSeed(value: string) {
  let seed = 0;

  for (let i = 0; i < value.length; i += 1) {
    seed = (seed * 31 + value.charCodeAt(i)) % 9973;
  }

  return seed;
}

function buildSeries(seed: number, anchor: number, range: RangeKey) {
  const points = range === 'all' ? 34 : range === '7d' ? 24 : 16;
  const wiggleFactor = range === 'all' ? 0.011 : range === '7d' ? 0.009 : 0.007;
  const driftFactor = range === 'all' ? 0.16 : range === '7d' ? 0.2 : 0.28;

  const series: number[] = [];
  let current = Math.max(0.12, Math.min(0.88, anchor - (range === 'all' ? 0.18 : range === '7d' ? 0.14 : 0.1)));

  for (let index = 0; index < points; index += 1) {
    const wiggle = (((seed + index * 19) % 13) - 6) * wiggleFactor;
    const drift = (anchor - current) * driftFactor;
    current = Math.max(0.08, Math.min(0.92, current + wiggle + drift));
    series.push(current);
  }

  series[series.length - 1] = anchor;
  return series;
}

function toPoints(values: number[]) {
  if (!values.length) return [] as Array<{ x: number; y: number }>;

  return values.map((value, index) => {
    const x = values.length === 1 ? 92 : 6 + (index / (values.length - 1)) * 88;
    const y = 7 + (1 - value) * 86;
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
  return `${line} L ${last.x.toFixed(2)} 95 L ${first.x.toFixed(2)} 95 Z`;
}

export function MarketTrendPanel({ slug, yesPrice, noPrice, volumeTotal, liquidity, participants, lang }: MarketTrendPanelProps) {
  const [range, setRange] = useState<RangeKey>('24h');
  const seed = hashSeed(slug);

  const series = useMemo(
    () => buildSeries(seed, Math.max(0.08, Math.min(0.92, yesPrice || 0.5)), range),
    [seed, yesPrice, range]
  );

  const points = useMemo(() => toPoints(series), [series]);
  const linePath = useMemo(() => toLinePath(points), [points]);
  const areaPath = useMemo(() => toAreaPath(points), [points]);
  const latestPoint = points[points.length - 1] ?? { x: 92, y: 50 };

  const changePp = (series[series.length - 1] - series[0]) * 100;
  const changeLabel = `${changePp >= 0 ? '+' : ''}${changePp.toFixed(1)}pp`;
  const axisValues = [90, 70, 50, 30, 10];

  const ranges: Array<{ key: RangeKey; label: string }> = [
    { key: '24h', label: '24H' },
    { key: '7d', label: '7D' },
    { key: 'all', label: tr(lang, 'ALL', 'ΟΛΑ') }
  ];

  return (
    <section className="marketTrendPanel">
      <div className="marketTrendHead">
        <div>
          <p className="marketTrendLabel">{tr(lang, 'Live YES chance', 'Ζωντανή πιθανότητα YES')}</p>
          <p className="marketTrendValue">{formatPercent(yesPrice)}</p>
        </div>

        <div className="marketTrendHeadRight">
          <div className={changePp >= 0 ? 'marketTrendDelta marketTrendDeltaUp' : 'marketTrendDelta marketTrendDeltaDown'}>{changeLabel}</div>
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
            <linearGradient id={`mantisTrend-${slug}`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="rgba(56,189,248,0.86)" />
              <stop offset="100%" stopColor="rgba(139,92,246,0.84)" />
            </linearGradient>
            <linearGradient id={`mantisTrendArea-${slug}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(99,102,241,0.22)" />
              <stop offset="100%" stopColor="rgba(99,102,241,0)" />
            </linearGradient>
          </defs>

          {axisValues.map((axis) => {
            const y = 7 + (1 - axis / 100) * 86;
            return (
              <line
                key={axis}
                x1="6"
                x2="94"
                y1={y.toFixed(2)}
                y2={y.toFixed(2)}
                stroke="rgba(224,230,244,0.08)"
                strokeDasharray="2 3"
              />
            );
          })}

          <path d={areaPath} fill={`url(#mantisTrendArea-${slug})`} />
          <path d={linePath} stroke={`url(#mantisTrend-${slug})`} strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <circle cx={latestPoint.x.toFixed(2)} cy={latestPoint.y.toFixed(2)} r="2.3" fill="#dbeafe" />
          <circle cx={latestPoint.x.toFixed(2)} cy={latestPoint.y.toFixed(2)} r="4.7" fill="rgba(219,234,254,0.22)" />
        </svg>

        <div className="marketTrendAxisY">
          {axisValues.map((value) => (
            <span key={value}>{value}%</span>
          ))}
        </div>

        <div className="marketTrendAxisX">
          <span>{range === '24h' ? tr(lang, '24h ago', '24ω πριν') : range === '7d' ? tr(lang, '7d ago', '7η πριν') : tr(lang, 'Start', 'Αρχή')}</span>
          <span>{tr(lang, 'Now', 'Τώρα')}</span>
        </div>

        <div className="marketTrendLatestTag" style={{ left: `${latestPoint.x}%`, top: `${Math.max(10, latestPoint.y - 11)}%` }}>
          {formatPercent(yesPrice)}
        </div>
      </div>

      <div className="marketTrendMeta">
        <span>{tr(lang, 'NO chance', 'Πιθανότητα NO')} {formatPercent(noPrice)}</span>
        <span>{tr(lang, 'Volume', 'Όγκος')} €{formatCompact(volumeTotal)}</span>
        <span>{tr(lang, 'Liquidity', 'Ρευστότητα')} €{formatCompact(liquidity)}</span>
        <span>{tr(lang, 'Participants', 'Συμμετέχοντες')} {participants}</span>
      </div>
    </section>
  );
}
