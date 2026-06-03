import { formatPercent } from '@/lib/format';
import {
  clampProbability,
  getProbabilityPercent,
  toProbabilityChartCoords,
  toSvgAreaPath,
  toSvgLinePath,
  type ProbabilityTrendPoint
} from '@/lib/probability-visuals';
import { tr, type UiLang } from '@/lib/ui-lang';

type ProbabilityChartProps = {
  chartId: string;
  points: ProbabilityTrendPoint[];
  lang: UiLang;
  startLabel: string;
  endLabel: string;
  loading?: boolean;
  showVolumeBars?: boolean;
  lowActivity?: boolean;
  lastTradeTime?: string | null;
};

const axisValues = [100, 75, 50, 25, 0];

function markerLabel(lastTradeTime: string | null | undefined, lang: UiLang) {
  return lastTradeTime ? tr(lang, 'Last print', 'Τελευταία εκτύπωση') : tr(lang, 'Current level', 'Τρέχον επίπεδο');
}

export function ProbabilityChart({
  chartId,
  points,
  lang,
  startLabel,
  endLabel,
  loading = false,
  showVolumeBars = true,
  lowActivity = false,
  lastTradeTime
}: ProbabilityChartProps) {
  const coords = toProbabilityChartCoords(points);
  const linePath = toSvgLinePath(coords);
  const areaPath = toSvgAreaPath(coords);
  const currentPoint = coords[coords.length - 1] ?? {
    x: 88,
    y: 49,
    point: { time: 'fallback', yesPrice: 0.5 }
  };
  const hasVolumeBars = showVolumeBars && points.some((point) => Number(point.tradeCount ?? point.volume ?? 0) > 0);
  const maxBarValue = hasVolumeBars
    ? Math.max(...points.map((point) => Number(point.tradeCount ?? point.volume ?? 0)), 1)
    : 1;

  return (
    <div className={lowActivity ? 'probabilityChart probabilityChartQuiet' : 'probabilityChart'}>
      <div className="probabilityChartStage" aria-hidden="true">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`${chartId}-area`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--mantis-signal-bg)" />
              <stop offset="100%" stopColor="rgba(82, 183, 255, 0)" />
            </linearGradient>
          </defs>

          {axisValues.map((axis) => {
            const y = 10 + (1 - axis / 100) * 78;

            return (
              <line
                key={axis}
                x1="8"
                x2="88"
                y1={y.toFixed(2)}
                y2={y.toFixed(2)}
                className="probabilityChartGridline"
              />
            );
          })}

          {hasVolumeBars
            ? coords.map((coord, index) => {
                const rawValue = Number(coord.point.tradeCount ?? coord.point.volume ?? 0);
                const height = rawValue > 0 ? 4 + (rawValue / maxBarValue) * 12 : 0;
                const y = 88 - height;

                return (
                  <rect
                    key={`${coord.point.time}-${index}`}
                    className="probabilityChartVolumeBar"
                    x={(coord.x - 0.5).toFixed(2)}
                    y={y.toFixed(2)}
                    width="1"
                    height={height.toFixed(2)}
                    rx="0.5"
                  />
                );
              })
            : null}

          <path d={areaPath} fill={`url(#${chartId}-area)`} className="probabilityChartArea" />
          <path
            d={linePath}
            pathLength={100}
            className="probabilityChartLine"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            shapeRendering="geometricPrecision"
          />

          {coords
            .filter((coord) => coord.point.eventLabel || coord.point.sourceLabel)
            .map((coord, index) => (
              <circle
                key={`${coord.point.time}-marker-${index}`}
                className="probabilityChartEventMarker"
                cx={coord.x.toFixed(2)}
                cy={coord.y.toFixed(2)}
                r="1.4"
              />
            ))}

          <g className="probabilityChartMarkerGroup">
            <circle className="probabilityChartMarkerHalo" cx={currentPoint.x.toFixed(2)} cy={currentPoint.y.toFixed(2)} r="4.1" />
            <circle className="probabilityChartMarkerRing" cx={currentPoint.x.toFixed(2)} cy={currentPoint.y.toFixed(2)} r="2.55" />
            <rect
              className="probabilityChartMarkerCore"
              x={(currentPoint.x - 0.95).toFixed(2)}
              y={(currentPoint.y - 0.95).toFixed(2)}
              width="1.9"
              height="1.9"
              rx="0.35"
            />
          </g>
        </svg>

        <div className="probabilityChartAxisY">
          {axisValues.map((value) => (
            <span key={value}>{value}%</span>
          ))}
        </div>

        <div className="probabilityChartAxisX">
          <span>{startLabel}</span>
          <span>{loading ? tr(lang, 'Updating…', 'Ενημέρωση…') : endLabel}</span>
        </div>

        <div className="probabilityChartMarkerLabel">
          <span>{markerLabel(lastTradeTime, lang)}</span>
          <strong>{formatPercent(clampProbability(currentPoint.point.yesPrice))}</strong>
        </div>
      </div>

      <div className="probabilityChartMeta">
        <span>{tr(lang, 'Current', 'Τρέχον')} {getProbabilityPercent(currentPoint.point.yesPrice)}%</span>
        <span>{markerLabel(lastTradeTime, lang)}</span>
      </div>
    </div>
  );
}
