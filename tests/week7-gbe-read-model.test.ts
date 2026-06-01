import assert from 'node:assert/strict';
import test from 'node:test';
import { eventEducationCopy, normalizeEventStatus, roundMetric } from '../lib/event-read-model.ts';

test('GBE education copy explains independent binary clusters in both languages', () => {
  assert.match(eventEducationCopy('en'), /Multiple markets can resolve YES/);
  assert.match(eventEducationCopy('el'), /Περισσότερες από μία αγορές/);
});

test('GBE status normalizer only exposes public event statuses', () => {
  assert.equal(normalizeEventStatus('open'), 'open');
  assert.equal(normalizeEventStatus('under_review'), 'under_review');
  assert.equal(normalizeEventStatus('settled'), 'settled');
  assert.equal(normalizeEventStatus('draft'), 'open');
});

test('GBE aggregate metric rounding is stable for board read models', () => {
  assert.equal(roundMetric(1.234), 1.23);
  assert.equal(roundMetric(1.235), 1.24);
  assert.equal(roundMetric(Number.NaN), 0);
});
