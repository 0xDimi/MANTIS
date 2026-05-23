import assert from 'node:assert/strict';
import test from 'node:test';
import { DISCOVER_BOARD_SCOPE, isInternalMarket } from '../lib/discover-board-config.ts';
import { getFeaturedMarketNews } from '../lib/featured-market-news.ts';

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

test('featured market news is curated context without outbound source fields', () => {
  const news = getFeaturedMarketNews('gre-politics-tsipras-new-party-before-jun1', 'en');

  assert.ok(news);
  assert.match(news.headline, /Tsipras/);
  assert.equal('sourceUrl' in news, false);
  assert.equal('sourceName' in news, false);
});

test('markets without curated news stay quiet', () => {
  assert.equal(getFeaturedMarketNews('gre-politics-cabinet-reshuffle-announced', 'en'), null);
});
