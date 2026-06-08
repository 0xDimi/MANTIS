import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { listMarketCardIconAssetPaths, resolveMarketCardIcon } from '../lib/market-card-icons.ts';

const repoRoot = path.resolve(import.meta.dirname, '..');
const publicRoot = path.join(repoRoot, 'public');

function assertPublicAssetExists(assetPath: string) {
  const relativePath = assetPath.replace(/^\//, '');
  const absolutePath = path.join(publicRoot, relativePath);
  assert.equal(existsSync(absolutePath), true, `expected asset to exist: ${assetPath}`);
}

function assertSingleIcon(
  icon: ReturnType<typeof resolveMarketCardIcon>
): asserts icon is Extract<ReturnType<typeof resolveMarketCardIcon>, { kind?: 'single' }> {
  assert.notEqual(icon.kind, 'pair');
}

test('all market-card asset paths resolve to files in public', () => {
  for (const assetPath of listMarketCardIconAssetPaths()) {
    assertPublicAssetExists(assetPath);
  }
});

test('US/Iran grouped markets resolve to the split-flag icon pair', () => {
  const icon = resolveMarketCardIcon({
    slug: 'global-us-iran-final-agreement-checkpoints-2026',
    question: 'Will the United States and Iran reach a final agreement before year end?'
  });

  assert.equal(icon.kind, 'pair');
  assert.equal(icon.leftSrc, '/market-card-icons/flag-us.svg');
  assert.equal(icon.rightSrc, '/market-card-icons/flag-iran.svg');
});

test('MarketCardIcon source explicitly handles pair icons with dedicated panes', () => {
  const componentPath = path.join(repoRoot, 'components', 'market-card-icon.tsx');
  const source = readFileSync(componentPath, 'utf8');

  assert.match(source, /icon\.kind === 'pair'/);
  assert.match(source, /marketCardIconPair/);
  assert.match(source, /icon\.leftSrc/);
  assert.match(source, /icon\.rightSrc/);
});

test('Bitcoin and SpaceX markets resolve to contain-fit logo assets', () => {
  const bitcoin = resolveMarketCardIcon({
    slug: 'crypto-bitcoin-above-150k-2026',
    question: 'Will Bitcoin trade above $150,000 by December 2026?'
  });
  const spacex = resolveMarketCardIcon({
    slug: 'tech-spacex-starship-orbit-2026',
    question: 'Will SpaceX put Starship into orbit in 2026?'
  });

  assertSingleIcon(bitcoin);
  assertSingleIcon(spacex);
  assert.equal(bitcoin.src, '/market-card-icons/logo-bitcoin.png');
  assert.equal(bitcoin.fit, 'contain');
  assert.equal(spacex.src, '/market-card-icons/logo-spacex.svg');
  assert.equal(spacex.fit, 'contain');
});

test('MarketCardIcon source keeps contain-fit handling for single-entity icons', () => {
  const componentPath = path.join(repoRoot, 'components', 'market-card-icon.tsx');
  const source = readFileSync(componentPath, 'utf8');

  assert.match(source, /marketCardIconImageContain/);
  assert.match(source, /icon\.src/);
});

test('generic category fallbacks still land on stable board thumbnails', () => {
  const economy = resolveMarketCardIcon({
    slug: 'gre-economy-cpi-above-5-may2026',
    question: 'Will Greece annual CPI print above 5.0% for May 2026?'
  });
  const sports = resolveMarketCardIcon({
    slug: 'gre-football-greek-clubs-uefa-league-phase-2026-27',
    question: 'How many Greek clubs will reach the UEFA league phase in 2026-27?'
  });

  assertSingleIcon(economy);
  assertSingleIcon(sports);
  assert.equal(economy.src, '/market-card-images/economy-chart.jpg');
  assert.equal(sports.src, '/market-card-images/sports-field.jpg');
});
