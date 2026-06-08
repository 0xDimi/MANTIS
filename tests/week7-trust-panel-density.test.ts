import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(import.meta.dirname, '..');

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('grouped event trust panel keeps the heading but no longer renders intro body copy', () => {
  const source = read('components/event-trust-panel.tsx');

  assert.match(source, /How this grouped event is verified/);
  assert.doesNotMatch(source, /This grouped event bundles independent YES\/NO markets/);
  assert.doesNotMatch(source, /Αυτό το ομαδοποιημένο γεγονός συγκεντρώνει ανεξάρτητες αγορές/);
  assert.doesNotMatch(source, /description:\s*string\s*\|\s*null/);
});

test('grouped event page does not pass description into the trust panel', () => {
  const source = read('app/events/[slug]/page.tsx');

  assert.match(source, /<EventTrustPanel/);
  assert.doesNotMatch(source, /description=\{eventDetail\.event\.description\}/);
});
