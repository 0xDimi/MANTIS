import { alphaGuardrails, clamp, round2, round6, round8 } from '@/lib/alpha-guardrails';

export type TradeSide = 'yes' | 'no';
export type TradeAction = 'buy' | 'sell';

export type AmmQuoteInput = {
  side: TradeSide;
  action: TradeAction;
  amountEur: number;
  pYes: number;
  depth: number;
  feeBps: number;
};

export type AmmQuoteResult = {
  side: TradeSide;
  action: TradeAction;
  amountEur: number;
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

function getImpact(amountEur: number, depth: number) {
  const safeDepth = Math.max(depth, 1);
  const raw = (amountEur / safeDepth) * 0.01;
  return clamp(raw, 0.0015, 0.12);
}

export function buildAmmV0Quote(input: AmmQuoteInput): AmmQuoteResult {
  const pYes = clamp(input.pYes, alphaGuardrails.probabilityFloor, alphaGuardrails.probabilityCeiling);
  const impact = getImpact(input.amountEur, input.depth);
  const feeAmountEur = round2(input.amountEur * (input.feeBps / 10_000));

  const sideDirection = input.side === 'yes' ? 1 : -1;
  const actionDirection = input.action === 'buy' ? 1 : -1;
  const signedImpact = impact * sideDirection * actionDirection;

  const postYesPrice = clamp(
    pYes + signedImpact,
    alphaGuardrails.probabilityFloor,
    alphaGuardrails.probabilityCeiling
  );
  const postNoPrice = round6(1 - postYesPrice);

  const startSidePrice = input.side === 'yes' ? pYes : 1 - pYes;
  const endSidePrice = input.side === 'yes' ? postYesPrice : postNoPrice;
  const averagePrice = round6(
    clamp(
      (startSidePrice + endSidePrice) / 2,
      alphaGuardrails.probabilityFloor,
      alphaGuardrails.probabilityCeiling
    )
  );

  const shareDelta = round8(input.amountEur / averagePrice);

  if (input.action === 'buy') {
    const totalAmountEur = round2(input.amountEur + feeAmountEur);
    const payoutIfCorrectEur = round2(shareDelta);
    const toWinEur = round2(Math.max(payoutIfCorrectEur - totalAmountEur, 0));

    return {
      side: input.side,
      action: input.action,
      amountEur: round2(input.amountEur),
      feeAmountEur,
      totalAmountEur,
      averagePrice,
      shareDelta,
      postYesPrice: round6(postYesPrice),
      postNoPrice,
      toWinEur,
      payoutIfCorrectEur,
      impact: round6(impact)
    };
  }

  const totalAmountEur = round2(Math.max(input.amountEur - feeAmountEur, 0));

  return {
    side: input.side,
    action: input.action,
    amountEur: round2(input.amountEur),
    feeAmountEur,
    totalAmountEur,
    averagePrice,
    shareDelta,
    postYesPrice: round6(postYesPrice),
    postNoPrice,
    toWinEur: 0,
    payoutIfCorrectEur: 0,
    impact: round6(impact)
  };
}

