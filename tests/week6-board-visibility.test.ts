import assert from 'node:assert/strict';
import test from 'node:test';
import { DISCOVER_BOARD_SCOPE, isInternalMarket } from '../lib/discover-board-config.ts';
import { localizedQuestionFromSlug } from '../lib/market-copy.ts';

test('discover board is locked to open-market scope', () => {
  assert.equal(DISCOVER_BOARD_SCOPE, 'open');
});

test('internal-market filter catches explicit smoke/admin fixtures only', () => {
  assert.equal(isInternalMarket('alpha-smoke-close-check', 'Will [SMOKE] market settle?'), true);
  assert.equal(isInternalMarket('admin-resolution-fixture', 'Admin lifecycle verification market'), true);
  assert.equal(
    isInternalMarket(
      'gre-social-streaming-topshow',
      'Will a Greek-produced series enter a top regional streaming chart this month?'
    ),
    false
  );
});

test('ops substring inside normal words does not hide real markets', () => {
  assert.equal(
    isInternalMarket('real-market-topshow', 'Will the Topshow ranking change this week?'),
    false
  );
  assert.equal(isInternalMarket('ops-health-check', 'Internal ops smoke check'), true);
});

test('new live markets have Greek question copy', () => {
  assert.equal(
    localizedQuestionFromSlug(
      'gre-weather-athens-33c-by-jun15-2026',
      'Will the maximum air temperature in Athens exceed 33°C through June 15, 2026?',
      'el'
    ),
    'Θα ξεπεράσει η μέγιστη θερμοκρασία στην Αθήνα τους 33°C έως και τις 15 Ιουνίου 2026;'
  );

  assert.equal(
    localizedQuestionFromSlug(
      'gre-markets-athex-general-index-2300-may29-2026',
      'Will the Athens Stock Exchange General Index close above 2,300 points by Friday, May 29, 2026?',
      'el'
    ),
    'Θα κλείσει ο Γενικός Δείκτης του Χρηματιστηρίου Αθηνών πάνω από τις 2.300 μονάδες έως την Παρασκευή 29 Μαΐου 2026;'
  );

  assert.match(
    localizedQuestionFromSlug(
      'gre-economy-cpi-above-5-may2026',
      'Will Greece annual CPI print above 5.0% for May 2026 at the June 10, 2026 ELSTAT release?',
      'el'
    ),
    /πληθωρισμός/
  );
});
