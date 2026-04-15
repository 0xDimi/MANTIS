#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = requiredEnv('NEXT_PUBLIC_SUPABASE_URL');
const serviceRoleKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');

const pollMs = Number(process.env.SIM_RESOLVE_POLL_MS ?? '60000');
const maxMinutes = Number(process.env.SIM_RESOLVE_MAX_MINUTES ?? '240');

const defaultOutcomes = {
  'gre-weather-athens-heatwave': 'yes',
  'gre-weather-thessaloniki-heavy-rain': 'void'
};

const outcomes = parseOutcomes(process.env.SIM_AUTO_OUTCOMES, defaultOutcomes);
const slugs = Object.keys(outcomes);

if (!Number.isFinite(pollMs) || pollMs < 5000) {
  fail('SIM_RESOLVE_POLL_MS must be >= 5000');
}

if (!Number.isFinite(maxMinutes) || maxMinutes <= 0) {
  fail('SIM_RESOLVE_MAX_MINUTES must be > 0');
}

const db = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

main().catch((error) => fail(error instanceof Error ? error.message : String(error)));

async function main() {
  const adminUserId = await resolveAdminUserId();
  const deadline = Date.now() + maxMinutes * 60_000;
  const pending = new Set(slugs);

  log(`auto-resolution armed for ${slugs.join(', ')}`);

  while (pending.size > 0) {
    if (Date.now() > deadline) {
      throw new Error(`timeout waiting for completion: ${Array.from(pending).join(', ')}`);
    }

    const markets = await readMarkets(slugs);
    const bySlug = new Map(markets.map((m) => [m.slug, m]));

    for (const slug of [...pending]) {
      const market = bySlug.get(slug);
      if (!market) {
        log(`warn: market not found for slug=${slug}`);
        continue;
      }

      if (market.status === 'settled') {
        pending.delete(slug);
        log(`done: ${slug} already settled`);
        continue;
      }

      const closeMs = new Date(market.close_time).getTime();
      const nowMs = Date.now();
      const outcome = outcomes[slug];

      if ((market.status === 'open' || market.status === 'paused') && Number.isFinite(closeMs) && nowMs >= closeMs) {
        await transitionToClosed(adminUserId, market.id, slug);
        continue;
      }

      if (market.status === 'closed') {
        await resolveMarket(adminUserId, market.id, slug, outcome);
        continue;
      }

      if (market.status === 'resolved' || market.status === 'void') {
        await settleMarket(adminUserId, market.id, slug);
        continue;
      }

      log(`wait: ${slug} status=${market.status} close=${market.close_time}`);
    }

    if (pending.size > 0) {
      await sleep(pollMs);
    }
  }

  log('auto-resolution completed for all configured markets');
}

async function resolveAdminUserId() {
  const { data, error } = await db
    .from('profiles')
    .select('user_id,role')
    .in('role', ['admin', 'super_admin'])
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`failed to resolve admin user id: ${error.message}`);
  }

  if (!data?.user_id) {
    throw new Error('no admin/super_admin profile found for auto-resolution');
  }

  return data.user_id;
}

async function readMarkets(slugList) {
  const { data, error } = await db
    .from('markets')
    .select('id,slug,status,close_time,resolution_time')
    .in('slug', slugList)
    .order('close_time', { ascending: true });

  if (error) {
    throw new Error(`failed to read markets: ${error.message}`);
  }

  return data ?? [];
}

async function transitionToClosed(adminUserId, marketId, slug) {
  const { error } = await db.rpc('admin_transition_market_status', {
    p_admin_user_id: adminUserId,
    p_market_id: marketId,
    p_target_status: 'closed'
  });

  if (error && !isIgnorable(error.message)) {
    throw new Error(`transition failed for ${slug}: ${error.message}`);
  }

  log(`action: ${slug} -> closed`);
}

async function resolveMarket(adminUserId, marketId, slug, outcome) {
  const summary = `Auto resolution (${outcome.toUpperCase()}) in simulation mode after close window.`;

  const { error } = await db.rpc('admin_record_market_resolution', {
    p_admin_user_id: adminUserId,
    p_market_id: marketId,
    p_outcome: outcome,
    p_evidence_summary: summary,
    p_evidence_url: null
  });

  if (error && !isIgnorable(error.message)) {
    throw new Error(`resolution failed for ${slug}: ${error.message}`);
  }

  log(`action: ${slug} resolved as ${outcome}`);
}

async function settleMarket(adminUserId, marketId, slug) {
  const { error } = await db.rpc('admin_settle_market', {
    p_admin_user_id: adminUserId,
    p_market_id: marketId
  });

  if (error && !isIgnorable(error.message)) {
    throw new Error(`settlement failed for ${slug}: ${error.message}`);
  }

  log(`action: ${slug} settled`);
}

function isIgnorable(message = '') {
  const m = message.toLowerCase();
  return (
    m.includes('already resolved') ||
    m.includes('settlement record exists') ||
    m.includes('market already') ||
    m.includes('must be closed before resolution') ||
    m.includes('must be resolved or void before settlement')
  );
}

function parseOutcomes(raw, fallback) {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`missing env: ${name}`);
  }
  return value;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function log(message) {
  console.log(`[sim-auto-resolution] ${new Date().toISOString()} ${message}`);
}

function fail(message) {
  console.error(`[sim-auto-resolution] ${message}`);
  process.exit(1);
}

