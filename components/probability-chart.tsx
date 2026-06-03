import { formatPercent } from '@/lib/format';
import { buildFlatProbabilitySeries, clampProbability, toProbabilityChartCoords, toSvgLinePath, type ProbabilityTrendPoint } from '@/lib/probability-visuals';
import { tr, type UiLang } from '@/lib/ui-lang';

type ProbabilityChartProps = {
  chartId: string;
  points: ProbabilityTrendPoint[];
  currentProbability: number;
  lang: UiLang;
  startLabel: string;
  endLabel: string;
  loading?: boolean;
};

function normalizeChartPoints(points: ProbabilityTrendPoint[], currentProbability: number) {
  const fallback = clampProbability(currentProbability);
  const safePoints = points
    .filter((point) => Number.isFinite(point.yesPrice))
    .map((point) => ({
      ...point,
      yesPrice: clampProbability(point.yesPrice, fallback)
    }));

  if (safePoints.length === 0) {
    return buildFlatProbabilitySeries(fallback, 2);
  }

  if (safePoints.length === 1) {
    return [
      safePoints[0],
      {
        ...safePoints[0],
        time: `${safePoints[0].time}-hold`
      }
    ];
  }

  return safePoints;
}

export function ProbabilityChart({
  chartId,
  points,
  currentProbability,
  lang,
  startLabel,
  endLabel,
  loading = false
}: ProbabilityChartProps) {
  const chartPoints = normalizeChartPoints(points, currentProbability);
  const coords = toProbabilityChartCoords(chartPoints, {
    xStart: 34,
    xEnd: 966,
    yTop: 28,
    yBottom: 226
  });
  const linePath = toSvgLinePath(coords);
  const currentPoint = coords[coords.length - 1] ?? {
    x: 966,
    y: 127,
    point: { time: 'fallback', yesPrice: clampProbability(currentProbability) }
  };
  const latestProbability = clampProbability(currentPoint.point.yesPrice, currentProbability);
  const lineGradientId = `${chartId}-line`;
  const softGlowId = `${chartId}-soft-glow`;
  const ariaLabel =
    lang === 'el'
      ? `Γράφημα πιθανότητας ΝΑΙ, τρέχουσα τιμή ${Math.round(latestProbability * 100)} τοις εκατό.`
      : `YES probability chart, current value ${Math.round(latestProbability * 100)} percent.`;

  return (
    <figure className="probabilityChart">
      <div className="probabilityChartStage">
        <svg
          role="img"
          aria-label={ariaLabel}
          viewBox="0 0 1000 260"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={lineGradientId} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="var(--mantis-chart-line-muted)" />
              <stop offset="72%" stopColor="var(--mantis-chart-line)" />
              <stop offset="100%" stopColor="var(--mantis-chart-line-strong)" />
            </linearGradient>
            <filter id={softGlowId} x="-10%" y="-80%" width="120%" height="260%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="0 0 0 0 0.25  0 0 0 0 0.60  0 0 0 0 1.00  0 0 0 0.24 0"
              />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d={linePath}
            pathLength={100}
            className="probabilityChartLine"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            shapeRendering="geometricPrecision"
            vectorEffect="non-scaling-stroke"
            stroke={`url(#${lineGradientId})`}
            filter={`url(#${softGlowId})`}
          />

          <g className="probabilityChartMarkerGroup">
            <circle className="probabilityChartMarkerHalo" cx={currentPoint.x.toFixed(2)} cy={currentPoint.y.toFixed(2)} r="7" />
            <circle className="probabilityChartMarkerCore" cx={currentPoint.x.toFixed(2)} cy={currentPoint.y.toFixed(2)} r="4" />
          </g>
        </svg>

        <div
          className="probabilityChartValue"
          aria-hidden="true"
          style={{
            top: `${(currentPoint.y / 260) * 100}%`
          }}
        >
          {formatPercent(latestProbability)}
        </div>
      </div>

      <figcaption className="probabilityChartAxis" aria-hidden="true">
        <span>{startLabel}</span>
        <span>{loading ? tr(lang, 'Updating…', 'Ενημέρωση…') : endLabel}</span>
      </figcaption>
    </figure>
  );
}
