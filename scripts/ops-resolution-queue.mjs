#!/usr/bin/env node
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';

const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const part = process.argv[i];
  if (!part.startsWith('--')) continue;
  const key = part.slice(2);
  const next = process.argv[i + 1];
  if (!next || next.startsWith('--')) {
    args.set(key, 'true');
  } else {
    args.set(key, next);
    i += 1;
  }
}

const lookaheadHours = Number(args.get('lookahead-hours') ?? '8');
const includeSmoke = (args.get('include-smoke') ?? 'false') === 'true';
const pretty = (args.get('pretty') ?? 'true') === 'true';
const failOnBacklog = (args.get('fail-on-backlog') ?? 'false') === 'true';
const maxOverdueOpen = Number(args.get('max-overdue-open') ?? (failOnBacklog ? '0' : 'Infinity'));
const maxUnresolvedClosed = Number(args.get('max-unresolved-closed') ?? (failOnBacklog ? '0' : 'Infinity'));
const maxResolvedUnsettled = Number(args.get('max-resolved-unsettled') ?? (failOnBacklog ? '0' : 'Infinity'));

if (!Number.isFinite(lookaheadHours) || lookaheadHours <= 0) {
  throw new Error('--lookahead-hours must be > 0');
}

const env = loadEnv(new URL('../.env.runtime.pull', import.meta.url));
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL missing from .env.runtime.pull');

const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || resolveServiceRoleKey(supabaseUrl);
const db = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const now = new Date();
const horizon = new Date(now.getTime() + lookaheadHours * 60 * 60 * 1000);

const { data: markets, error: marketError } = await db
  .from('markets')
  .select('id,slug,question,category,status,close_time,resolution_time,updated_at')
  .order('close_time', { ascending: true })
  .limit(400);

if (marketError) throw new Error(`failed to load markets: ${marketError.message}`);

const rows = (markets ?? []).filter((row) => includeSmoke || isRealMarket(row.slug));
const closedLikeIds = rows.filter((row) => row.status === 'closed' || row.status === 'resolved' || row.status === 'void').map((row) => row.id);

const [{ data: resolutions, error: resolutionsError }, { data: settlements, error: settlementsError }] = await Promise.all([
  closedLikeIds.length
    ? db.from('resolutions').select('market_id,outcome,evidence_summary,created_at').in('market_id', closedLikeIds)
    : Promise.resolve({ data: [], error: null }),
  closedLikeIds.length
    ? db.from('market_settlements').select('market_id,outcome,created_at').in('market_id', closedLikeIds)
    : Promise.resolve({ data: [], error: null })
]);

if (resolutionsError) throw new Error(`failed to load resolutions: ${resolutionsError.message}`);
if (settlementsError) throw new Error(`failed to load settlements: ${settlementsError.message}`);

const resolutionByMarketId = new Map((resolutions ?? []).map((row) => [row.market_id, row]));
const settlementByMarketId = new Map((settlements ?? []).map((row) => [row.market_id, row]));

const queue = {
  generatedAt: now.toISOString(),
  lookaheadHours,
  includeSmoke,
  thresholds: {
    failOnBacklog,
    maxOverdueOpen,
    maxUnresolvedClosed,
    maxResolvedUnsettled
  },
  summary: {
    realMarketsScanned: rows.length,
    upcomingOpen: 0,
    overdueOpen: 0,
    unresolvedClosed: 0,
    resolvedUnsettled: 0,
    backlogHealthy: true
  },
  violations: [],
  upcomingOpen: [],
  overdueOpen: [],
  unresolvedClosed: [],
  resolvedUnsettled: []
};

for (const row of rows) {
  const closeMs = new Date(row.close_time).getTime();
  const resolution = resolutionByMarketId.get(row.id) ?? null;
  const settlement = settlementByMarketId.get(row.id) ?? null;

  const payload = {
    id: row.id,
    slug: row.slug,
    question: row.question,
    category: row.category,
    status: row.status,
    close_time: row.close_time,
    resolution_time: row.resolution_time,
    updated_at: row.updated_at,
    resolution: resolution
      ? {
          outcome: resolution.outcome,
          evidence_summary: resolution.evidence_summary,
          created_at: resolution.created_at
        }
      : null,
    settlement: settlement
      ? {
          outcome: settlement.outcome,
          created_at: settlement.created_at
        }
      : null
  };

  if (row.status === 'open' && Number.isFinite(closeMs) && closeMs > now.getTime() && closeMs <= horizon.getTime()) {
    queue.upcomingOpen.push(payload);
    continue;
  }

  if ((row.status === 'open' || row.status === 'paused') && Number.isFinite(closeMs) && closeMs <= now.getTime()) {
    queue.overdueOpen.push(payload);
    continue;
  }

  if (row.status === 'closed' && !resolution) {
    queue.unresolvedClosed.push(payload);
    continue;
  }

  if ((row.status === 'resolved' || row.status === 'void') && !settlement) {
    queue.resolvedUnsettled.push(payload);
  }
}

queue.summary.upcomingOpen = queue.upcomingOpen.length;
queue.summary.overdueOpen = queue.overdueOpen.length;
queue.summary.unresolvedClosed = queue.unresolvedClosed.length;
queue.summary.resolvedUnsettled = queue.resolvedUnsettled.length;

if (queue.summary.overdueOpen > maxOverdueOpen) {
  queue.violations.push(`overdueOpen=${queue.summary.overdueOpen} exceeds ${maxOverdueOpen}`);
}
if (queue.summary.unresolvedClosed > maxUnresolvedClosed) {
  queue.violations.push(`unresolvedClosed=${queue.summary.unresolvedClosed} exceeds ${maxUnresolvedClosed}`);
}
if (queue.summary.resolvedUnsettled > maxResolvedUnsettled) {
  queue.violations.push(`resolvedUnsettled=${queue.summary.resolvedUnsettled} exceeds ${maxResolvedUnsettled}`);
}
queue.summary.backlogHealthy = queue.violations.length === 0;

console.log(JSON.stringify(queue, null, pretty ? 2 : 0));

if (queue.violations.length > 0) {
  console.error(`BACKLOG_GUARD ${queue.violations.join('; ')}`);
  process.exitCode = 1;
}

function loadEnv(url) {
  if (!fs.existsSync(url)) return {};
  const raw = fs.readFileSync(url, 'utf8');
  const env = {};
  for (const line of raw.split('\n')) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const [key, ...rest] = line.split('=');
    env[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '');
  }
  return env;
}

function resolveServiceRoleKey(supabaseUrl) {
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
  const keys = JSON.parse(execFileSync('supabase', ['projects', 'api-keys', '--project-ref', projectRef, '-o', 'json'], { encoding: 'utf8' }));
  const legacy = keys.find((entry) => entry?.id === 'service_role' && entry?.type === 'legacy')?.api_key;
  if (!legacy) throw new Error('unable to resolve service role key from Supabase CLI');
  return legacy;
}

function isRealMarket(slug = '') {
  return !(
    slug.startsWith('alpha-smoke-') ||
    slug.startsWith('admin-smoke-') ||
    slug.startsWith('settle-') ||
    slug.includes('[SMOKE]')
  );
}
