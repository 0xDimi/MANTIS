import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAmmV0Quote } from '../lib/amm-v0.ts';
import {
  TradeRequestError,
  assertMarketOpenForTrading,
  evaluateUserTradeLimits,
  parseTradeAction,
  parseTradeSide,
  resolveQuoteExpiry,
  resolveTradeInputMode
} from '../lib/trade-guards.ts';

test('rejects invalid trade enums before execution repricing', () => {
  assert.throws(() => parseTradeSide('maybe'), (error: unknown) => {
    assert.ok(error instanceof TradeRequestError);
    assert.equal(error.statusCode, 400);
    assert.match(error.message, /side must be yes or no/);
    return true;
  });

  assert.throws(() => parseTradeAction('hold'), (error: unknown) => {
    assert.ok(error instanceof TradeRequestError);
    assert.equal(error.statusCode, 400);
    assert.match(error.message, /action must be buy or sell/);
    return true;
  });
});

test('sell requests treat any provided shareAmount as the active input mode', () => {
  assert.equal(resolveTradeInputMode('buy', 4), 'total_cash');
  assert.equal(resolveTradeInputMode('sell', undefined), 'gross_cash');
  assert.equal(resolveTradeInputMode('sell', 0), 'shares');
  assert.equal(resolveTradeInputMode('sell', '2.5'), 'shares');
});

test('quote expiry is capped by market close time', () => {
  const now = new Date('2026-04-12T12:00:00.000Z');
  const expiresAt = resolveQuoteExpiry({
    now,
    closeTime: '2026-04-12T12:00:10.000Z',
    ttlSeconds: 25
  });

  assert.equal(expiresAt.toISOString(), '2026-04-12T12:00:10.000Z');
});

test('markets stop accepting trades once close_time has passed even if status is still open', () => {
  assert.throws(
    () =>
      assertMarketOpenForTrading({
        status: 'open',
        closeTime: '2026-04-12T11:59:59.000Z',
        now: new Date('2026-04-12T12:00:00.000Z')
      }),
    (error: unknown) => {
      assert.ok(error instanceof TradeRequestError);
      assert.equal(error.statusCode, 409);
      assert.match(error.message, /market trading window has closed/);
      return true;
    }
  );
});

test('buy quotes fail fast on exposure overflow before SQL execution', () => {
  const quote = buildAmmV0Quote({
    side: 'yes',
    action: 'buy',
    inputMode: 'total_cash',
    amountEur: 25,
    qYes: 120,
    qNo: 120,
    depth: 288.539,
    feeBps: 200
  });

  assert.throws(
    () =>
      evaluateUserTradeLimits({
        action: 'buy',
        side: 'yes',
        shareDelta: quote.shareDelta,
        totalAmountEur: quote.totalAmountEur,
        currentExposureEur: 980,
        maxUserExposureEur: 1000
      }),
    (error: unknown) => {
      assert.ok(error instanceof TradeRequestError);
      assert.equal(error.statusCode, 400);
      assert.match(error.message, /max user exposure per market/);
      return true;
    }
  );
});

test('sell quotes fail fast when requested shares exceed holdings', () => {
  const quote = buildAmmV0Quote({
    side: 'yes',
    action: 'sell',
    inputMode: 'shares',
    shareAmount: 2,
    qYes: 120,
    qNo: 120,
    depth: 288.539,
    feeBps: 200
  });

  assert.throws(
    () =>
      evaluateUserTradeLimits({
        action: 'sell',
        side: 'yes',
        shareDelta: quote.shareDelta,
        totalAmountEur: quote.totalAmountEur,
        currentExposureEur: 200,
        availableShares: 1.5
      }),
    (error: unknown) => {
      assert.ok(error instanceof TradeRequestError);
      assert.equal(error.statusCode, 400);
      assert.match(error.message, /insufficient yes shares/);
      return true;
    }
  );
});

test('AMM quote remains monotonic and fill stays inside the side-price band', () => {
  const quote = buildAmmV0Quote({
    side: 'yes',
    action: 'buy',
    inputMode: 'gross_cash',
    amountEur: 50,
    qYes: 0,
    qNo: 0,
    depth: 288.539,
    feeBps: 200
  });

  assert.equal(quote.postYesPrice > 0.5, true);
  assert.equal(quote.averagePrice >= 0.5 && quote.averagePrice <= quote.postYesPrice, true);
  assert.equal(quote.totalAmountEur, quote.amountEur + quote.feeAmountEur);
  assert.equal(Number((quote.postYesPrice + quote.postNoPrice).toFixed(6)), 1);
});
