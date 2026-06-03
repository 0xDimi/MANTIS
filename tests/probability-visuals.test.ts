import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildFlatProbabilitySeries,
  clampProbability,
  getProbabilityChangePp,
  getProbabilityPercent,
  isLowActivityWindow
} from '../lib/probability-visuals.ts';

test('clampProbability keeps values inside the 0-1 band', () => {
  assert.equal(clampProbability(-0.2), 0);
  assert.equal(clampProbability(1.4), 1);
  assert.equal(clampProbability(Number.NaN), 0.5);
  assert.equal(clampProbability(0.64), 0.64);
});

test('buildFlatProbabilitySeries creates at least two anchored points', () => {
  const series = buildFlatProbabilitySeries(0.73, 1);

  assert.equal(series.length, 2);
  assert.deepEqual(
    series.map((point) => point.yesPrice),
    [0.73, 0.73]
  );
});

test('getProbabilityChangePp returns basis-point style delta in percentage points', () => {
  const change = getProbabilityChangePp([
    { time: 'a', yesPrice: 0.41 },
    { time: 'b', yesPrice: 0.58 }
  ]);

  assert.equal(change, 17);
});

test('quiet windows are treated as first-class low activity states', () => {
  assert.equal(isLowActivityWindow(0), true);
  assert.equal(isLowActivityWindow(2), true);
  assert.equal(isLowActivityWindow(3), false);
  assert.equal(getProbabilityPercent(0.645), 65);
});
