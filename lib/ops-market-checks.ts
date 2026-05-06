export type MarketCheckMode = 'baseline' | 'high_risk' | 'overnight';

export type NormalizedMarketState = {
  last_trade_at: string | null;
  volume_total: number;
} | null;

export function normalizeMarketState(
  input:
    | NormalizedMarketState
    | Array<{
        last_trade_at: string | null;
        volume_total: number;
      }>
) {
  if (Array.isArray(input)) {
    return input[0] ?? null;
  }

  return input ?? null;
}

export function diffMinutes(nowIso: string, pastIso: string | null | undefined) {
  if (!pastIso) return Number.POSITIVE_INFINITY;
  const diff = new Date(nowIso).getTime() - new Date(pastIso).getTime();
  if (!Number.isFinite(diff)) return Number.POSITIVE_INFINITY;
  return diff / 60_000;
}

export function isHighRiskCloseWindow(closeTime: string, now = new Date(), lookaheadHours = 24) {
  const closeMs = new Date(closeTime).getTime();

  return Number.isFinite(closeMs) && closeMs - now.getTime() <= lookaheadHours * 60 * 60 * 1000;
}

export function isOverdueMarket(closeTime: string, now = new Date()) {
  const closeMs = new Date(closeTime).getTime();
  return Number.isFinite(closeMs) && closeMs <= now.getTime();
}

export function resolveSchedule({
  hourAthens,
  hasHighRiskWindow,
  hasEarlyResolutionCandidates
}: {
  hourAthens: number;
  hasHighRiskWindow: boolean;
  hasEarlyResolutionCandidates: boolean;
}): { mode: MarketCheckMode; intervalMinutes: number } | null {
  if (hasHighRiskWindow || hasEarlyResolutionCandidates) {
    return { mode: 'high_risk', intervalMinutes: 20 };
  }

  if (hourAthens >= 9 && hourAthens <= 23) {
    return { mode: 'baseline', intervalMinutes: 120 };
  }

  if (hourAthens >= 2 && hourAthens < 3) {
    return { mode: 'overnight', intervalMinutes: 24 * 60 };
  }

  return null;
}

export function summarizeStaleOpenMarkets<T extends { slug: string; close_time: string; market_state: NormalizedMarketState }>(
  markets: T[],
  nowIso: string,
  staleAfterMinutes = 12 * 60,
  limit = 8
) {
  return markets
    .map((row) => {
      const lastTradeAt = row.market_state?.last_trade_at ?? null;
      return {
        slug: row.slug,
        closeTime: row.close_time,
        lastTradeAt,
        minutesSinceTrade: diffMinutes(nowIso, lastTradeAt)
      };
    })
    .filter((row) => Number.isFinite(row.minutesSinceTrade) && row.minutesSinceTrade >= staleAfterMinutes)
    .sort((a, b) => b.minutesSinceTrade - a.minutesSinceTrade)
    .slice(0, limit);
}
