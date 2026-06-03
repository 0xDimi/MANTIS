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

const axisValues = [100, 75, 50, 25, 0] as const;
const chartBounds = {
  xStart: 34,
  xEnd: 920,
  yTop: 28,
  yBottom: 226,
  height: 260
} as const;

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
  const coords = toProbabilityChartCoords(chartPoints, chartBounds);
  const linePath = toSvgLinePath(coords);
  const currentPoint = coords[coords.length - 1] ?? {
    x: chartBounds.xEnd,
    y: 127,
    point: { time: 'fallback', yesPrice: clampProbability(currentProbability) }
  };
  const latestProbability = clampProbability(currentPoint.point.yesPrice, currentProbability);
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
          {axisValues.map((value) => {
            const ratio = value / 100;
            const y = chartBounds.yTop + (1 - ratio) * (chartBounds.yBottom - chartBounds.yTop);

            return (
              <line
                key={value}
                className="probabilityChartGridline"
                x1={chartBounds.xStart.toFixed(2)}
                x2={chartBounds.xEnd.toFixed(2)}
                y1={y.toFixed(2)}
                y2={y.toFixed(2)}
              />
            );
          })}

          <path
            d={linePath}
            className="probabilityChartLineGlow"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            shapeRendering="geometricPrecision"
            vectorEffect="non-scaling-stroke"
          />

          <path
            d={linePath}
            pathLength={100}
            className="probabilityChartLine"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            shapeRendering="geometricPrecision"
            vectorEffect="non-scaling-stroke"
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
            top: `${(currentPoint.y / chartBounds.height) * 100}%`
          }}
        >
          {formatPercent(latestProbability)}
        </div>

        <div className="probabilityChartAxisY" aria-hidden="true">
          {axisValues.map((value) => (
            <span key={value}>{value}%</span>
          ))}
        </div>
      </div>

      <figcaption className="probabilityChartAxis" aria-hidden="true">
        <span>{startLabel}</span>
        <span>{loading ? tr(lang, 'Updating…', 'Ενημέρωση…') : endLabel}</span>
      </figcaption>
    </figure>
  );
}
