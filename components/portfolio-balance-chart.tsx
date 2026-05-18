'use client';

import { useMemo } from 'react';
import { tr, type UiLang } from '@/lib/ui-lang';

type BalancePoint = {
  time: string;
  balanceAfter: number;
  entryType: string;
};

function toPoints(values: number[]) {
  if (!values.length) return [] as Array<{ x: number; y: number }>;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 1);

  return values.map((value, index) => {
    const x = values.length === 1 ? 94 : 6 + (index / (values.length - 1)) * 88;
    const normalized = (value - min) / span;
    const y = 12 + (1 - normalized) * 76;
    return { x, y };
  });
}

function toLinePath(points: Array<{ x: number; y: number }>) {
  if (!points.length) return '';
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
}

function toAreaPath(points: Array<{ x: number; y: number }>) {
  if (!points.length) return '';
  const first = points[0];
  const last = points[points.length - 1];
  return `${toLinePath(points)} L ${last.x.toFixed(2)} 92 L ${first.x.toFixed(2)} 92 Z`;
}

function fmtMoney(value: number, lang: UiLang) {
  return new Intl.NumberFormat(lang === 'el' ? 'el-GR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2
  }).format(value);
}

function fmtTime(value: string, lang: UiLang) {
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return '—';
  return parsed.toLocaleDateString(lang === 'el' ? 'el-GR' : 'en-GB', {
    day: '2-digit',
    month: '2-digit'
  });
}

export function PortfolioBalanceChart({
  points,
  lang
}: {
  points: BalancePoint[];
  lang: UiLang;
}) {
  const values = points.map((point) => point.balanceAfter);
  const plotPoints = useMemo(() => toPoints(values), [values]);
  const linePath = useMemo(() => toLinePath(plotPoints), [plotPoints]);
  const areaPath = useMemo(() => toAreaPath(plotPoints), [plotPoints]);
  const latestPoint = plotPoints[plotPoints.length - 1] ?? { x: 94, y: 50 };
  const startValue = values[0] ?? 0;
  const endValue = values[values.length - 1] ?? 0;
  const delta = endValue - startValue;
  const deltaLabel = `${delta >= 0 ? '+' : ''}${fmtMoney(delta, lang)}`;
  const axisValues = useMemo(() => {
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 0);
    const span = Math.max(max - min, 1);
    return [max, max - span / 2, min].map((value) => Math.round(value));
  }, [values]);

  return (
    <section className="portfolioChartCard">
      <div className="portfolioChartHead">
        <div>
          <p className="eyebrow">{tr(lang, 'Cash path', 'Πορεία μετρητών')}</p>
          <h4>{fmtMoney(endValue, lang)}</h4>
        </div>
        <div className={delta >= 0 ? 'portfolioChartDelta portfolioPnlUp' : 'portfolioChartDelta portfolioPnlDown'}>
          {deltaLabel}
        </div>
      </div>

      <div className="portfolioChartStage" aria-hidden="true">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mantisPortfolioArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(82, 198, 255, 0.16)" />
              <stop offset="100%" stopColor="rgba(82, 198, 255, 0)" />
            </linearGradient>
          </defs>

          {axisValues.map((value, index) => {
            const y = index === 0 ? 12 : index === 1 ? 50 : 88;
            return <line key={`${value}-${index}`} x1="6" x2="94" y1={y} y2={y} stroke="rgba(199,214,241,0.12)" strokeDasharray="1 5" />;
          })}

          <path d={areaPath} fill="url(#mantisPortfolioArea)" />
          <path d={linePath} stroke="#52c6ff" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={latestPoint.x.toFixed(2)} cy={latestPoint.y.toFixed(2)} r="1.8" fill="#52c6ff" />
          <circle cx={latestPoint.x.toFixed(2)} cy={latestPoint.y.toFixed(2)} r="4" fill="rgba(82, 198, 255, 0.12)" />
        </svg>

        <div className="portfolioChartAxisY">
          {axisValues.map((value, index) => (
            <span key={`${value}-${index}`}>{fmtMoney(value, lang)}</span>
          ))}
        </div>

        <div className="portfolioChartAxisX">
          <span>{fmtTime(points[0]?.time ?? new Date().toISOString(), lang)}</span>
          <span>{fmtTime(points[points.length - 1]?.time ?? new Date().toISOString(), lang)}</span>
        </div>
      </div>
    </section>
  );
}
