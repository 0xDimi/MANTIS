import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertLifecycleTransition,
  assertResolutionAllowed,
  deriveResolutionStatus,
  getAllowedLifecycleTransitions,
  parseLifecycleTargetStatus,
  parseResolutionOutcome,
  validateEvidenceSummary,
  validateEvidenceUrl
} from '../lib/admin-market-ops.ts';

test('lifecycle helper exposes only supported transitions for live admin controls', () => {
  assert.deepEqual(
    getAllowedLifecycleTransitions({
      status: 'open',
      closeTime: '2026-04-20T12:00:00.000Z',
      now: new Date('2026-04-13T12:00:00.000Z')
    }),
    ['paused', 'closed']
  );

  assert.deepEqual(
    getAllowedLifecycleTransitions({
      status: 'closed',
      closeTime: '2026-04-13T11:00:00.000Z',
      now: new Date('2026-04-13T12:00:00.000Z')
    }),
    []
  );
});

test('closed markets cannot reopen after close_time has passed', () => {
  assert.throws(
    () =>
      assertLifecycleTransition({
        currentStatus: 'closed',
        targetStatus: 'open',
        closeTime: '2026-04-13T11:59:59.000Z',
        now: new Date('2026-04-13T12:00:00.000Z')
      }),
    /only reopen before close_time/
  );
});

test('resolution workflow maps YES and NO to resolved, VOID to void', () => {
  assert.equal(deriveResolutionStatus('yes'), 'resolved');
  assert.equal(deriveResolutionStatus('no'), 'resolved');
  assert.equal(deriveResolutionStatus('void'), 'void');
});

test('resolution helper requires closed status and blocks settled markets', () => {
  assert.throws(() => assertResolutionAllowed({ marketStatus: 'open', outcome: 'yes' }), /must be closed/);
  assert.throws(() => assertResolutionAllowed({ marketStatus: 'settled', outcome: 'no' }), /cannot be re-resolved/);

  assert.doesNotThrow(() => assertResolutionAllowed({ marketStatus: 'closed', outcome: 'void' }));
});

test('resolution evidence validators reject weak summaries and invalid urls', () => {
  assert.throws(() => validateEvidenceSummary('too short'), /at least 12 characters/);
  assert.equal(validateEvidenceSummary('Primary source reviewed and manually confirmed.'), 'Primary source reviewed and manually confirmed.');

  assert.equal(validateEvidenceUrl(''), null);
  assert.throws(() => validateEvidenceUrl('ftp://example.com/file'), /http or https/);
  assert.equal(validateEvidenceUrl('https://example.com/result'), 'https://example.com/result');
});

test('enum parsers reject terminal lifecycle misuse and invalid outcomes', () => {
  assert.throws(() => parseLifecycleTargetStatus('resolved'), /targetStatus must be one of/);
  assert.equal(parseLifecycleTargetStatus('paused'), 'paused');

  assert.throws(() => parseResolutionOutcome('maybe'), /outcome must be yes, no, or void/);
  assert.equal(parseResolutionOutcome('void'), 'void');
});
