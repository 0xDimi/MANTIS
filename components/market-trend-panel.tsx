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
  yesLabel?: string;
};

type RangeKey = '24h' | '7d' | 'all';

function buildSeries(anchor: number, range: RangeKey) {
  const points = range === 'all' ? 34 : range === '7d' ? 24 : 16;
  const value = Math.max(0.02, Math.min(0.98, anchor || 0.5));

  return Array.from({ length: points }, () => value);
}

function toPoints(values: number[]) {
  if (!values.length) return [] as Array<{ x: number; y: number }>;

  return values.map((value, index) => {
    const x = values.length === 1 ? 92 : 8 + (index / (values.length - 1)) * 84;
    const y = 10 + (1 - value) * 80;
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
  noPrice,
  volumeTotal,
  liquidity,
  participants,
  lang,
  yesLabel = 'YES'
}: MarketTrendPanelProps) {
  const [range, setRange] = useState<RangeKey>('24h');

  const series = useMemo(() => buildSeries(yesPrice, range), [yesPrice, range]);
  const points = useMemo(() => toPoints(series), [series]);
  const linePath = useMemo(() => toLinePath(points), [points]);
  const areaPath = useMemo(() => toAreaPath(points), [points]);
  const latestPoint = points[points.length - 1] ?? { x: 92, y: 50 };
  const changePp = (series[series.length - 1] - series[0]) * 100;
  const isFlat = Math.abs(changePp) < 0.01;
  const changeLabel = isFlat
    ? tr(lang, 'Stable', 'Σταθερό')
    : `${changePp >= 0 ? '+' : ''}${changePp.toFixed(1)}pp`;
  const axisValues = [100, 75, 50, 25, 0];

  const ranges: Array<{ key: RangeKey; label: string }> = [
    { key: '24h', label: '24H' },
    { key: '7d', label: '7D' },
    { key: 'all', label: tr(lang, 'ALL', 'ΟΛΑ') }
  ];

  return (
    <section className="marketTrendPanel">
      <div className="marketTrendHead">
        <div>
          <p className="marketTrendLabel">{tr(lang, 'Live chance', 'Ζωντανή πιθανότητα')} {yesLabel}</p>
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
            <linearGradient id={`mantisTrend-${slug}`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="rgba(56,189,248,0.94)" />
              <stop offset="100%" stopColor="rgba(139,92,246,0.88)" />
            </linearGradient>
            <linearGradient id={`mantisTrendArea-${slug}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(99,102,241,0.24)" />
              <stop offset="100%" stopColor="rgba(99,102,241,0)" />
            </linearGradient>
          </defs>

          {axisValues.map((axis) => {
            const y = 10 + (1 - axis / 100) * 80;
            return (
              <line
                key={axis}
                x1="8"
                x2="92"
                y1={y.toFixed(2)}
                y2={y.toFixed(2)}
                stroke="rgba(220, 230, 248, 0.12)"
                strokeDasharray="2 4"
              />
            );
          })}

          <path d={areaPath} fill={`url(#mantisTrendArea-${slug})`} />
          <path d={linePath} stroke={`url(#mantisTrend-${slug})`} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={latestPoint.x.toFixed(2)} cy={latestPoint.y.toFixed(2)} r="2.5" fill="#e5edff" />
          <circle cx={latestPoint.x.toFixed(2)} cy={latestPoint.y.toFixed(2)} r="5.3" fill="rgba(165, 180, 252, 0.22)" />
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

        <div className="marketTrendLatestTag" style={{ left: `${Math.min(94, latestPoint.x + 2)}%`, top: `${Math.max(12, latestPoint.y - 10)}%` }}>
          {formatPercent(yesPrice)}
        </div>
      </div>

      <div className="marketTrendMeta">
        <span>{tr(lang, 'Chance', 'Πιθανότητα')} {yesLabel}: {formatPercent(yesPrice)}</span>
        <span>{tr(lang, 'NO chance', 'Πιθανότητα Όχι')} {formatPercent(noPrice)}</span>
        <span>{tr(lang, 'Volume', 'Όγκος')} €{formatCompact(volumeTotal, lang)}</span>
        <span>{tr(lang, 'Liquidity', 'Ρευστότητα')} €{formatCompact(liquidity, lang)}</span>
        <span>{tr(lang, 'Participants', 'Συμμετέχοντες')} {participants}</span>
      </div>
    </section>
  );
}
