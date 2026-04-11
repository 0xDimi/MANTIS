import { alphaGuardrails, round2, round6, round8 } from '@/lib/alpha-guardrails';

export type TradeSide = 'yes' | 'no';
export type TradeAction = 'buy' | 'sell';
export type TradeInputMode = 'gross_cash' | 'total_cash' | 'shares';

export type AmmQuoteInput = {
  side: TradeSide;
  action: TradeAction;
  amountEur?: number;
  shareAmount?: number;
  inputMode?: TradeInputMode;
  qYes: number;
  qNo: number;
  depth: number;
  feeBps: number;
};

export type AmmQuoteResult = {
  side: TradeSide;
  action: TradeAction;
  inputMode: TradeInputMode;
  amountEur: number;
  requestedAmount: number;
  requestedShares: number | null;
  feeAmountEur: number;
  totalAmountEur: number;
  averagePrice: number;
  shareDelta: number;
  postYesPrice: number;
  postNoPrice: number;
  toWinEur: number;
  payoutIfCorrectEur: number;
  impact: number;
};

type MarketState = {
  qYes: number;
  qNo: number;
  b: number;
  feeBps: number;
};

function assertFinitePositive(value: number, name: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a finite positive number`);
  }
}

function assertFiniteNonNegative(value: number, name: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a finite non-negative number`);
  }
}

function assertProbability(p: number, name = 'probability') {
  if (!Number.isFinite(p) || p <= 0 || p >= 1) {
    throw new Error(`${name} must be in (0, 1)`);
  }
}

function assertWithinProbabilityGuardrail(p: number) {
  const { probabilityFloor, probabilityCeiling } = alphaGuardrails;

  if (p < probabilityFloor - 1e-12 || p > probabilityCeiling + 1e-12) {
    throw new Error(
      `trade breaches probability guardrail (${probabilityFloor} - ${probabilityCeiling}), request a smaller trade`
    );
  }
}

function sigmoid(x: number) {
  if (x >= 0) {
    const z = Math.exp(-x);
    return 1 / (1 + z);
  }

  const z = Math.exp(x);
  return z / (1 + z);
}

function logit(p: number) {
  assertProbability(p);
  return Math.log(p / (1 - p));
}

function logSumExp(a: number, b: number) {
  const max = Math.max(a, b);
  return max + Math.log(Math.exp(a - max) + Math.exp(b - max));
}

function normalizeMarketState(input: AmmQuoteInput): MarketState {
  assertFinitePositive(input.depth, 'depth');
  assertFiniteNonNegative(input.qYes, 'qYes');
  assertFiniteNonNegative(input.qNo, 'qNo');

  return {
    qYes: input.qYes,
    qNo: input.qNo,
    b: input.depth,
    feeBps: input.feeBps
  };
}

function currentYesPrice(state: Pick<MarketState, 'qYes' | 'qNo' | 'b'>) {
  assertFinitePositive(state.b, 'b');
  return sigmoid((state.qYes - state.qNo) / state.b);
}

function currentNoPrice(state: Pick<MarketState, 'qYes' | 'qNo' | 'b'>) {
  return 1 - currentYesPrice(state);
}

function cost(state: Pick<MarketState, 'qYes' | 'qNo' | 'b'>) {
  assertFinitePositive(state.b, 'b');
  return state.b * logSumExp(state.qYes / state.b, state.qNo / state.b);
}

function roundRequestedAmount(inputMode: TradeInputMode, value: number) {
  return inputMode === 'shares' ? round8(value) : round2(value);
}

function buildQuoteResult(input: {
  side: TradeSide;
  action: TradeAction;
  inputMode: TradeInputMode;
  requestedAmount: number;
  requestedShares: number | null;
  shares: number;
  grossCash: number;
  stateBefore: MarketState;
  stateAfter: MarketState;
}): AmmQuoteResult {
  assertFinitePositive(input.shares, 'shares');
  assertFinitePositive(input.grossCash, 'grossCash');

  const pYesBefore = currentYesPrice(input.stateBefore);
  const pYesAfter = currentYesPrice(input.stateAfter);
  assertWithinProbabilityGuardrail(pYesAfter);

  const amountEur = round2(input.grossCash);
  const feeAmountEur = round2(amountEur * (input.stateBefore.feeBps / 10_000));
  const totalAmountEur =
    input.action === 'buy' ? round2(amountEur + feeAmountEur) : round2(Math.max(amountEur - feeAmountEur, 0));
  const shareDelta = round8(input.shares);

  return {
    side: input.side,
    action: input.action,
    inputMode: input.inputMode,
    amountEur,
    requestedAmount: roundRequestedAmount(input.inputMode, input.requestedAmount),
    requestedShares: input.requestedShares == null ? null : round8(input.requestedShares),
    feeAmountEur,
    totalAmountEur,
    averagePrice: round6(input.grossCash / input.shares),
    shareDelta,
    postYesPrice: round6(pYesAfter),
    postNoPrice: round6(currentNoPrice(input.stateAfter)),
    toWinEur: input.action === 'buy' ? round2(Math.max(shareDelta - totalAmountEur, 0)) : 0,
    payoutIfCorrectEur: input.action === 'buy' ? round2(shareDelta) : 0,
    impact: round6(Math.abs(pYesAfter - pYesBefore))
  };
}

function quoteByShares(input: {
  state: MarketState;
  side: TradeSide;
  action: TradeAction;
  shares: number;
  inputMode: TradeInputMode;
  requestedAmount: number;
  requestedShares: number | null;
}): AmmQuoteResult {
  const { state, side, action, shares } = input;
  assertFinitePositive(shares, 'shares');

  let qYesAfter = state.qYes;
  let qNoAfter = state.qNo;

  if (side === 'yes') {
    qYesAfter = action === 'buy' ? state.qYes + shares : state.qYes - shares;
  } else {
    qNoAfter = action === 'buy' ? state.qNo + shares : state.qNo - shares;
  }

  if (qYesAfter < 0 || qNoAfter < 0) {
    throw new Error('share sale would push market state negative; requote with a smaller size');
  }

  const stateAfter: MarketState = {
    ...state,
    qYes: qYesAfter,
    qNo: qNoAfter
  };

  const rawDelta = cost(stateAfter) - cost(state);
  const grossCash = action === 'buy' ? rawDelta : -rawDelta;

  if (grossCash <= 0) {
    throw new Error('grossCash must be positive');
  }

  return buildQuoteResult({
    side,
    action,
    inputMode: input.inputMode,
    requestedAmount: input.requestedAmount,
    requestedShares: input.requestedShares,
    shares,
    grossCash,
    stateBefore: state,
    stateAfter
  });
}

function quoteBuyByGrossCash(state: MarketState, side: TradeSide, grossCash: number): AmmQuoteResult {
  assertFinitePositive(grossCash, 'grossCash');

  const p0 = currentYesPrice(state);
  const p1 = side === 'yes' ? 1 - (1 - p0) * Math.exp(-grossCash / state.b) : p0 * Math.exp(-grossCash / state.b);
  assertProbability(p1, 'post-trade probability');
  assertWithinProbabilityGuardrail(p1);

  const shares = Math.abs(state.b * (logit(p1) - logit(p0)));

  return quoteByShares({
    state,
    side,
    action: 'buy',
    shares,
    inputMode: 'gross_cash',
    requestedAmount: grossCash,
    requestedShares: null
  });
}

function quoteSellByGrossPayout(state: MarketState, side: TradeSide, grossPayout: number): AmmQuoteResult {
  assertFinitePositive(grossPayout, 'grossPayout');

  const p0 = currentYesPrice(state);
  const p1 = side === 'yes' ? 1 - (1 - p0) * Math.exp(grossPayout / state.b) : p0 * Math.exp(grossPayout / state.b);
  assertProbability(p1, 'post-trade probability');
  assertWithinProbabilityGuardrail(p1);

  const shares = Math.abs(state.b * (logit(p1) - logit(p0)));

  return quoteByShares({
    state,
    side,
    action: 'sell',
    shares,
    inputMode: 'gross_cash',
    requestedAmount: grossPayout,
    requestedShares: null
  });
}

function quoteBuyByTotalCash(state: MarketState, side: TradeSide, totalCash: number): AmmQuoteResult {
  assertFinitePositive(totalCash, 'totalCash');
  const grossCash = totalCash / (1 + state.feeBps / 10_000);
  const quote = quoteBuyByGrossCash(state, side, grossCash);

  return {
    ...quote,
    inputMode: 'total_cash',
    requestedAmount: round2(totalCash)
  };
}

export function buildAmmV0Quote(input: AmmQuoteInput): AmmQuoteResult {
  const state = normalizeMarketState(input);
  const inputMode = input.inputMode ?? (input.action === 'sell' && input.shareAmount ? 'shares' : 'gross_cash');

  if (inputMode === 'shares') {
    const shareAmount = Number(input.shareAmount ?? 0);

    if (!Number.isFinite(shareAmount) || shareAmount <= 0) {
      throw new Error('shareAmount must be > 0');
    }

    return quoteByShares({
      state,
      side: input.side,
      action: input.action,
      shares: shareAmount,
      inputMode,
      requestedAmount: shareAmount,
      requestedShares: shareAmount
    });
  }

  const amountEur = Number(input.amountEur ?? 0);

  if (!Number.isFinite(amountEur) || amountEur <= 0) {
    throw new Error('amountEur must be > 0');
  }

  if (inputMode === 'total_cash') {
    if (input.action !== 'buy') {
      throw new Error('total_cash is only supported for buy quotes');
    }

    return quoteBuyByTotalCash(state, input.side, amountEur);
  }

  if (input.action === 'buy') {
    return quoteBuyByGrossCash(state, input.side, amountEur);
  }

  return quoteSellByGrossPayout(state, input.side, amountEur);
}
