export const alphaGuardrails = {
  probabilityFloor: 0.01,
  probabilityCeiling: 0.99,
  quoteTtlSeconds: 25,
  maxSingleTradeEur: 250,
  maxUserExposurePerMarketEur: 1000
} as const;

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function round2(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function round6(value: number) {
  return Math.round((value + Number.EPSILON) * 1_000_000) / 1_000_000;
}

export function round8(value: number) {
  return Math.round((value + Number.EPSILON) * 100_000_000) / 100_000_000;
}

