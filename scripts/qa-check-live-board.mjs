#!/usr/bin/env node

const baseUrl = (process.argv[2] || process.env.APP_BASE_URL || 'https://mantis-demo.xyz').replace(/\/$/, '');
const htmlUrl = `${baseUrl}/?qa_board_check=${Date.now()}`;

const marketsPayload = await fetchJson(`${baseUrl}/api/markets`);
const html = await fetchText(htmlUrl);

const realOpenMarkets = (marketsPayload.markets ?? []).filter(
  (market) => (market.status === 'open' || market.status === 'paused') && !isInternalMarket(market.slug, market.question)
);

if (realOpenMarkets.length === 0) {
  fail('live board check found zero real open markets from /api/markets');
}

const expectedCount = realOpenMarkets.length;
const missingQuestions = realOpenMarkets.filter((market) => !html.includes(market.question)).map((market) => market.slug);
if (missingQuestions.length > 0) {
  fail(`homepage is missing real open markets: ${missingQuestions.join(', ')}`);
}

console.log(`PASS live board count=${expectedCount} all real open markets visible`);

function isInternalMarket(slug = '', question = '') {
  const target = `${slug} ${question}`.toLowerCase().replace(/[^a-z0-9]+/g, ' ');
  return /\b(smoke|qa|test|sim|internal|ops|lifecycle|admin)\b/.test(target);
}

async function fetchJson(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) fail(`request failed ${url} (${res.status})`);
  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) fail(`request failed ${url} (${res.status})`);
  return res.text();
}

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exit(1);
}
