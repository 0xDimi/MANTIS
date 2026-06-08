#!/usr/bin/env node
import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { listMarketCardIconAssetPaths, resolveMarketCardIcon } from '../lib/market-card-icons.ts';

const requireGitTracked = process.argv.includes('--require-git-tracked');
const repoRoot = path.resolve(import.meta.dirname, '..');
const publicRoot = path.join(repoRoot, 'public');

const representativeCases = [
  {
    label: 'US/Iran pair',
    input: {
      slug: 'global-us-iran-final-agreement-checkpoints-2026',
      question: 'Will the United States and Iran reach a final agreement before year end?'
    },
    expect: (icon) => icon.kind === 'pair' && icon.leftSrc === '/market-card-icons/flag-us.svg' && icon.rightSrc === '/market-card-icons/flag-iran.svg'
  },
  {
    label: 'Bitcoin icon',
    input: {
      slug: 'crypto-bitcoin-above-150k-2026',
      question: 'Will Bitcoin trade above $150,000 by December 2026?'
    },
    expect: (icon) => icon.src === '/market-card-icons/logo-bitcoin.png' && icon.fit === 'contain'
  },
  {
    label: 'SpaceX icon',
    input: {
      slug: 'tech-spacex-starship-orbit-2026',
      question: 'Will SpaceX put Starship into orbit in 2026?'
    },
    expect: (icon) => icon.src === '/market-card-icons/logo-spacex.svg' && icon.fit === 'contain'
  },
  {
    label: 'Economy fallback',
    input: {
      slug: 'gre-economy-cpi-above-5-may2026',
      question: 'Will Greece annual CPI print above 5.0% for May 2026?'
    },
    expect: (icon) => icon.src === '/market-card-images/economy-chart.jpg'
  }
];

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`PASS ${message}`);
}

function ensureAssetExists(assetPath) {
  const relativePath = assetPath.replace(/^\//, '');
  const repoRelativePath = path.join('public', relativePath);
  const absolutePath = path.join(publicRoot, relativePath);

  if (!existsSync(absolutePath)) {
    fail(`missing asset file ${assetPath}`);
  }

  if (requireGitTracked) {
    const tracked = spawnSync('git', ['ls-files', '--error-unmatch', repoRelativePath], {
      cwd: repoRoot,
      encoding: 'utf8'
    });

    if (tracked.status !== 0) {
      fail(`asset is not tracked by git: ${assetPath}`);
    }
  }
}

for (const assetPath of listMarketCardIconAssetPaths()) {
  ensureAssetExists(assetPath);
}
pass(`validated ${listMarketCardIconAssetPaths().length} market-card asset paths`);

for (const sample of representativeCases) {
  const icon = resolveMarketCardIcon(sample.input);

  if (!sample.expect(icon)) {
    fail(`resolver mismatch for ${sample.label}`);
  }
}
pass(`validated ${representativeCases.length} representative market-card resolver cases`);
