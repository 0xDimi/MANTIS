export type ProbabilityTrendPoint = {
  time: string;
  yesPrice: number;
  tradeCount?: number | null;
  volume?: number | null;
  eventLabel?: string | null;
  sourceLabel?: string | null;
};

export type ProbabilityChartCoord = {
  x: number;
  y: number;
  point: ProbabilityTrendPoint;
};

export function clampProbability(value: number, fallback = 0.5) {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(0, Math.min(1, value));
}

export function getProbabilityPercent(value: number) {
  return Math.round(clampProbability(value) * 100);
}

export function buildFlatProbabilitySeries(anchor: number, count = 2) {
  const safeAnchor = clampProbability(anchor);
  const safeCount = Math.max(2, Math.floor(count));

  return Array.from({ length: safeCount }, (_, index) => ({
    time: `flat-${index}`,
    yesPrice: safeAnchor,
    tradeCount: 0
  })) satisfies ProbabilityTrendPoint[];
}

export function getProbabilityChangePp(points: ProbabilityTrendPoint[]) {
  if (points.length < 2) return 0;

  const start = clampProbability(points[0]?.yesPrice ?? 0.5);
  const end = clampProbability(points[points.length - 1]?.yesPrice ?? 0.5);

  return (end - start) * 100;
}

export function isLowActivityWindow(tradeCount?: number | null) {
  return (tradeCount ?? 0) < 3;
}

export function toProbabilityChartCoords(
  points: ProbabilityTrendPoint[],
  options?: {
    xStart?: number;
    xEnd?: number;
    yTop?: number;
    yBottom?: number;
  }
) {
  if (!points.length) return [] as ProbabilityChartCoord[];

  const xStart = options?.xStart ?? 8;
  const xEnd = options?.xEnd ?? 88;
  const yTop = options?.yTop ?? 10;
  const yBottom = options?.yBottom ?? 88;

  return points.map((point, index) => {
    const ratio = points.length === 1 ? 1 : index / (points.length - 1);
    const x = xStart + ratio * (xEnd - xStart);
    const y = yTop + (1 - clampProbability(point.yesPrice)) * (yBottom - yTop);

    return {
      x,
      y,
      point
    };
  });
}

export function toSvgLinePath(points: ProbabilityChartCoord[]) {
  if (!points.length) return '';

  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');
}

export function toSvgAreaPath(points: ProbabilityChartCoord[], baseline = 88) {
  if (!points.length) return '';

  const line = toSvgLinePath(points);
  const first = points[0];
  const last = points[points.length - 1];

  return `${line} L ${last.x.toFixed(2)} ${baseline.toFixed(2)} L ${first.x.toFixed(2)} ${baseline.toFixed(2)} Z`;
}
