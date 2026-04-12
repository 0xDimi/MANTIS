import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertSettlementAllowed,
  computePositionSettlement,
  deriveSettlementPrices,
  roundCurrency
} from '../lib/settlement-ops.ts';

test('resolved YES settlement pays winning shares and realizes both-side basis', () => {
  const settlement = computePositionSettlement({
    outcome: 'yes',
    yesShares: 12.3456,
    noShares: 4.5,
    yesCostBasis: 9.4,
    noCostBasis: 3.2
  });

  assert.equal(settlement.entryType, 'settlement');
  assert.equal(settlement.payoutAmount, 12.35);
  assert.equal(settlement.refundAmount, 0);
  assert.equal(settlement.totalCostBasis, 12.6);
  assert.equal(settlement.walletDelta, 12.35);
  assert.equal(settlement.realizedDelta, -0.25);
});

test('resolved NO settlement pays NO shares and leaves losing YES basis realized as loss', () => {
  const settlement = computePositionSettlement({
    outcome: 'no',
    yesShares: 8.1,
    noShares: 15.499,
    yesCostBasis: 5.6,
    noCostBasis: 10.2
  });

  assert.equal(settlement.payoutAmount, 15.5);
  assert.equal(settlement.totalCostBasis, 15.8);
  assert.equal(settlement.realizedDelta, -0.3);
});

test('void settlement refunds full open basis and does not move realized pnl', () => {
  const settlement = computePositionSettlement({
    outcome: 'void',
    yesShares: 3.25,
    noShares: 6.75,
    yesCostBasis: 7.8,
    noCostBasis: 11.05
  });

  assert.equal(settlement.entryType, 'void_refund');
  assert.equal(settlement.payoutAmount, 0);
  assert.equal(settlement.refundAmount, 18.85);
  assert.equal(settlement.walletDelta, 18.85);
  assert.equal(settlement.realizedDelta, 0);
});

test('settlement guard only allows resolved and void statuses with matching outcomes', () => {
  assert.throws(() => assertSettlementAllowed({ marketStatus: 'closed', resolutionOutcome: 'yes' }), /resolved or void/);
  assert.throws(() => assertSettlementAllowed({ marketStatus: 'settled', resolutionOutcome: 'yes' }), /already settled/);
  assert.throws(() => assertSettlementAllowed({ marketStatus: 'void', resolutionOutcome: 'yes' }), /void resolution/);
  assert.throws(() => assertSettlementAllowed({ marketStatus: 'resolved', resolutionOutcome: 'void' }), /yes or no resolution/);

  assert.doesNotThrow(() => assertSettlementAllowed({ marketStatus: 'resolved', resolutionOutcome: 'yes' }));
  assert.doesNotThrow(() => assertSettlementAllowed({ marketStatus: 'void', resolutionOutcome: 'void' }));
});

test('settlement price helpers expose terminal market-state values', () => {
  assert.deepEqual(deriveSettlementPrices('yes'), { yesPrice: 1, noPrice: 0 });
  assert.deepEqual(deriveSettlementPrices('no'), { yesPrice: 0, noPrice: 1 });
  assert.deepEqual(deriveSettlementPrices('void'), { yesPrice: 0.5, noPrice: 0.5 });
  assert.equal(roundCurrency(1.005), 1.01);
});
