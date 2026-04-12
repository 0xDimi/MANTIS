import type { Database } from '@/types/database';

type MarketStatus = Database['public']['Enums']['market_status'];
type ResolutionOutcome = Database['public']['Enums']['resolution_outcome'];
type EntryType = Database['public']['Enums']['entry_type'];

export function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function deriveSettlementPrices(outcome: ResolutionOutcome) {
  if (outcome === 'yes') {
    return { yesPrice: 1, noPrice: 0 };
  }

  if (outcome === 'no') {
    return { yesPrice: 0, noPrice: 1 };
  }

  return { yesPrice: 0.5, noPrice: 0.5 };
}

export function assertSettlementAllowed({
  marketStatus,
  resolutionOutcome,
  settlementExists = false
}: {
  marketStatus: MarketStatus;
  resolutionOutcome?: ResolutionOutcome | null;
  settlementExists?: boolean;
}) {
  if (settlementExists || marketStatus === 'settled') {
    throw new Error('market already settled');
  }

  if (marketStatus !== 'resolved' && marketStatus !== 'void') {
    throw new Error('market must be resolved or void before settlement');
  }

  if (!resolutionOutcome) {
    throw new Error('market resolution missing');
  }

  if (marketStatus === 'void' && resolutionOutcome !== 'void') {
    throw new Error('void market requires a void resolution');
  }

  if (marketStatus === 'resolved' && resolutionOutcome === 'void') {
    throw new Error('resolved market requires a yes or no resolution');
  }
}

export function computePositionSettlement({
  outcome,
  yesShares,
  noShares,
  yesCostBasis,
  noCostBasis
}: {
  outcome: ResolutionOutcome;
  yesShares: number;
  noShares: number;
  yesCostBasis: number;
  noCostBasis: number;
}) {
  const normalized = {
    yesShares: Number.isFinite(yesShares) ? yesShares : 0,
    noShares: Number.isFinite(noShares) ? noShares : 0,
    yesCostBasis: roundCurrency(Number.isFinite(yesCostBasis) ? yesCostBasis : 0),
    noCostBasis: roundCurrency(Number.isFinite(noCostBasis) ? noCostBasis : 0)
  };

  const totalCostBasis = roundCurrency(normalized.yesCostBasis + normalized.noCostBasis);
  const winningShares = outcome === 'yes' ? normalized.yesShares : outcome === 'no' ? normalized.noShares : 0;
  const payoutAmount = outcome === 'void' ? 0 : roundCurrency(winningShares);
  const refundAmount = outcome === 'void' ? totalCostBasis : 0;
  const walletDelta = roundCurrency(payoutAmount + refundAmount);
  const realizedDelta = outcome === 'void' ? 0 : roundCurrency(walletDelta - totalCostBasis);
  const entryType: EntryType = outcome === 'void' ? 'void_refund' : 'settlement';

  return {
    entryType,
    totalCostBasis,
    payoutAmount,
    refundAmount,
    walletDelta,
    realizedDelta,
    winningShares,
    hasExposure:
      normalized.yesShares > 0 || normalized.noShares > 0 || normalized.yesCostBasis > 0 || normalized.noCostBasis > 0
  };
}
