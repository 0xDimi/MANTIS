#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

const baseUrl = (process.env.APP_BASE_URL ?? 'https://xyz-labs-demo.vercel.app').replace(/\/$/, '');
const supabaseUrl = requiredEnv('NEXT_PUBLIC_SUPABASE_URL');
const anonKey = requiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const tradeAmountEur = Number(process.env.SMOKE_TRADE_AMOUNT_EUR ?? '5');
const verifyProfileRls = process.env.SMOKE_VERIFY_PROFILE_RLS === '1';

if (!Number.isFinite(tradeAmountEur) || tradeAmountEur <= 0) {
  fail('SMOKE_TRADE_AMOUNT_EUR must be a positive number');
}

const serviceRoleKey = resolveServiceRoleKey();
const adminDb = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const runStamp = `${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}-${crypto.randomBytes(3).toString('hex')}`;

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});

async function main() {
  const adminUser = await createConfirmedUser({ label: 'admin', role: 'admin', displayName: 'Alpha Smoke Admin' });
  const payoutTrader = await createConfirmedUser({ label: 'payout-trader', role: 'tester', displayName: 'Alpha Smoke Payout Trader' });
  const voidTrader = await createConfirmedUser({ label: 'void-trader', role: 'tester', displayName: 'Alpha Smoke Void Trader' });
  const escalationProbe = verifyProfileRls
    ? await createConfirmedUser({ label: 'rls-guard', role: 'tester', displayName: 'Alpha Smoke Guard' })
    : null;

  const adminCookie = await buildAuthCookie(adminUser.email, adminUser.password);
  const payoutCookie = await buildAuthCookie(payoutTrader.email, payoutTrader.password);
  const voidCookie = await buildAuthCookie(voidTrader.email, voidTrader.password);

  if (escalationProbe) {
    await verifyProfileEscalationBlocked(escalationProbe);
  }

  const lifecycleMarket = await createSmokeMarket({
    label: 'lifecycle',
    adminUserId: adminUser.userId,
    status: 'draft'
  });
  const payoutMarket = await createSmokeMarket({
    label: 'settle-yes',
    adminUserId: adminUser.userId,
    status: 'open'
  });
  const voidMarket = await createSmokeMarket({
    label: 'settle-void',
    adminUserId: adminUser.userId,
    status: 'open'
  });

  await runLifecycleFlow({ adminCookie, market: lifecycleMarket });
  await runSettlementFlow({
    label: 'resolved payout',
    traderCookie: payoutCookie,
    market: payoutMarket,
    adminCookie,
    expectedResolution: 'yes',
    expectedSettlementField: 'total_payout',
    expectedSettlementResponseField: 'totalPayout'
  });
  await runSettlementFlow({
    label: 'void refund',
    traderCookie: voidCookie,
    market: voidMarket,
    adminCookie,
    expectedResolution: 'void',
    expectedSettlementField: 'total_refund',
    expectedSettlementResponseField: 'totalRefund'
  });

  pass(`admin smoke pack complete lifecycle=${lifecycleMarket.slug} payout=${payoutMarket.slug} void=${voidMarket.slug}`);
}

async function verifyProfileEscalationBlocked(user) {
  const client = createClient(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const signIn = await client.auth.signInWithPassword({ email: user.email, password: user.password });
  if (signIn.error || !signIn.data.user) {
    throw new Error(`profile escalation probe sign-in failed: ${signIn.error?.message ?? 'unknown error'}`);
  }

  const updateResult = await client.from('profiles').update({ role: 'admin' }).eq('user_id', user.userId);
  const roleResult = await adminDb.from('profiles').select('role').eq('user_id', user.userId).limit(1).maybeSingle();

  if (roleResult.error) {
    throw new Error(`failed to read profile role after escalation probe: ${roleResult.error.message}`);
  }

  const role = roleResult.data?.role ?? null;
  if (role !== 'tester') {
    throw new Error('profile role escalation is still possible on runtime');
  }

  if (!updateResult.error) {
    throw new Error('profile escalation probe unexpectedly succeeded without an error');
  }

  pass('profiles RLS blocks self-promotion to admin');
}

async function runLifecycleFlow({ adminCookie, market }) {
  const transitions = [
    ['open', 'draft'],
    ['paused', 'open'],
    ['open', 'paused'],
    ['closed', 'open']
  ];

  for (const [targetStatus, previousStatus] of transitions) {
    const response = await requestJson('POST', `/api/admin/markets/${market.id}/status`, {
      cookie: adminCookie,
      body: { targetStatus }
    });

    expectStatus(response, 200, `admin lifecycle ${previousStatus}->${targetStatus} failed`);
    expect(response.json?.market?.previousStatus === previousStatus, `lifecycle previousStatus mismatch for ${targetStatus}`);
    expect(response.json?.market?.status === targetStatus, `lifecycle target status mismatch for ${targetStatus}`);
  }

  const detail = await requestJson('GET', `/api/markets/${market.slug}`);
  expectStatus(detail, 200, 'lifecycle market detail readback failed');
  expect(detail.json?.market?.status === 'closed', 'lifecycle market did not stay closed on public readback');

  pass(`admin lifecycle draft->open->paused->open->closed slug=${market.slug}`);
}

async function runSettlementFlow({
  label,
  traderCookie,
  market,
  adminCookie,
  expectedResolution,
  expectedSettlementField,
  expectedSettlementResponseField
}) {
  const portfolioBeforeTrade = await getPortfolio(traderCookie, `${label} portfolio before trade failed`);
  const walletBeforeTrade = Number(portfolioBeforeTrade.wallet?.availableBalance ?? 0);

  const quoteResponse = await requestJson('POST', '/api/quotes/preview', {
    cookie: traderCookie,
    body: {
      marketId: market.id,
      side: 'yes',
      action: 'buy',
      amountEur: tradeAmountEur
    }
  });
  expectStatus(quoteResponse, 200, `${label} quote preview failed`);
  expect(Number(quoteResponse.json?.quote?.shareDelta ?? 0) > 0, `${label} quote preview returned no shares`);

  const executeResponse = await requestJson('POST', '/api/trades/execute', {
    cookie: traderCookie,
    body: {
      marketId: market.id,
      side: 'yes',
      action: 'buy',
      amountEur: tradeAmountEur,
      quoteHash: quoteResponse.json?.quoteHash,
      quoteExpiresAt: quoteResponse.json?.expiresAt
    }
  });
  expectStatus(executeResponse, 200, `${label} trade execute failed`);
  expect(executeResponse.json?.status === 'executed', `${label} trade did not execute`);

  const portfolioAfterTrade = await getPortfolio(traderCookie, `${label} portfolio after trade failed`);
  const walletAfterTrade = Number(portfolioAfterTrade.wallet?.availableBalance ?? 0);
  expect(walletAfterTrade < walletBeforeTrade, `${label} wallet did not decrease after trade`);
  expect(
    Array.isArray(portfolioAfterTrade.positions) && portfolioAfterTrade.positions.some((position) => position.marketId === market.id),
    `${label} portfolio missing traded market before settlement`
  );

  const closeResponse = await requestJson('POST', `/api/admin/markets/${market.id}/status`, {
    cookie: adminCookie,
    body: { targetStatus: 'closed' }
  });
  expectStatus(closeResponse, 200, `${label} close-market step failed`);
  expect(closeResponse.json?.market?.status === 'closed', `${label} market did not close`);

  const resolutionResponse = await requestJson('POST', '/api/admin/resolution', {
    cookie: adminCookie,
    body: {
      marketId: market.id,
      outcome: expectedResolution,
      evidenceSummary: `Smoke evidence confirmed for ${label} ${runStamp}`,
      evidenceUrl: 'https://example.com/smoke-evidence'
    }
  });
  expectStatus(resolutionResponse, 200, `${label} resolution failed`);
  expect(resolutionResponse.json?.resolution?.outcome === expectedResolution, `${label} resolution outcome mismatch`);

  const detailAfterResolution = await requestJson('GET', `/api/markets/${market.slug}`);
  expectStatus(detailAfterResolution, 200, `${label} market detail after resolution failed`);
  expect(detailAfterResolution.json?.resolution?.outcome === expectedResolution, `${label} public detail missing resolution outcome`);
  expect(
    detailAfterResolution.json?.market?.status === (expectedResolution === 'void' ? 'void' : 'resolved'),
    `${label} market status did not transition after resolution`
  );

  const settlementResponse = await requestJson('POST', '/api/admin/settlement', {
    cookie: adminCookie,
    body: { marketId: market.id }
  });
  expectStatus(settlementResponse, 200, `${label} settlement failed`);
  expect(settlementResponse.json?.settlement?.outcome === expectedResolution, `${label} settlement outcome mismatch`);
  expect(
    Number(settlementResponse.json?.settlement?.[expectedSettlementResponseField] ?? 0) > 0,
    `${label} settlement summary did not move ${expectedSettlementResponseField}`
  );

  const detailAfterSettlement = await requestJson('GET', `/api/markets/${market.slug}`);
  expectStatus(detailAfterSettlement, 200, `${label} market detail after settlement failed`);
  expect(detailAfterSettlement.json?.market?.status === 'settled', `${label} market did not settle on public readback`);
  expect(Number(detailAfterSettlement.json?.settlement?.[expectedSettlementField] ?? 0) > 0, `${label} public detail missing ${expectedSettlementField}`);

  const portfolioAfterSettlement = await getPortfolio(traderCookie, `${label} portfolio after settlement failed`);
  const walletAfterSettlement = Number(portfolioAfterSettlement.wallet?.availableBalance ?? 0);
  expect(walletAfterSettlement > walletAfterTrade, `${label} wallet did not improve after settlement`);
  expect(
    Array.isArray(portfolioAfterSettlement.positions) && !portfolioAfterSettlement.positions.some((position) => position.marketId === market.id),
    `${label} portfolio still shows settled market exposure`
  );

  pass(`${label} resolution + settlement slug=${market.slug} wallet=${walletAfterTrade.toFixed(2)}->${walletAfterSettlement.toFixed(2)}`);
}

async function getPortfolio(cookie, failureLabel) {
  const response = await requestJson('GET', '/api/portfolio/summary', { cookie });
  expectStatus(response, 200, failureLabel);
  expect(response.json?.wallet != null, `${failureLabel}: missing wallet payload`);
  return response.json;
}

async function createConfirmedUser({ label, role, displayName }) {
  const localPart = `alpha.smoke.${label}.${runStamp}`;
  const email = `${localPart}@gmail.com`;
  const password = `${displayName.replace(/\s+/g, '')}!${crypto.randomBytes(4).toString('hex')}`;

  const created = await adminDb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: displayName }
  });

  if (created.error || !created.data.user) {
    throw new Error(`failed to create ${label} user: ${created.error?.message ?? 'unknown error'}`);
  }

  const userId = created.data.user.id;

  const [{ error: profileError }, { error: walletError }] = await Promise.all([
    adminDb.from('profiles').upsert({ user_id: userId, display_name: displayName, role, locale: 'en' }, { onConflict: 'user_id' }),
    adminDb
      .from('wallet_accounts')
      .upsert({ user_id: userId, currency: 'PAPER_EUR', starting_balance: 1000, available_balance: 1000, realized_pnl: 0 }, { onConflict: 'user_id' })
  ]);

  if (profileError || walletError) {
    throw new Error(`failed to bootstrap ${label} user: ${profileError?.message ?? walletError?.message ?? 'unknown error'}`);
  }

  return { email, password, userId };
}

async function createSmokeMarket({ label, adminUserId, status }) {
  const slug = `alpha-smoke-${label}-${runStamp}`;
  const closeTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const resolutionTime = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString();

  const insertedMarket = await adminDb
    .from('markets')
    .insert({
      slug,
      question: `[SMOKE] ${label} ${runStamp}?`,
      description: `Week 6 smoke market for ${label}`,
      category: 'ops',
      status,
      close_time: closeTime,
      resolution_time: resolutionTime,
      source_primary: 'https://example.com/smoke-primary',
      source_fallback: 'https://example.com/smoke-fallback',
      void_rule: 'Void if the smoke workflow is interrupted or incomplete.',
      b_liquidity: 100,
      fee_bps: 50,
      yes_label: 'YES',
      no_label: 'NO',
      created_by: adminUserId
    })
    .select('id,slug')
    .single();

  if (insertedMarket.error || !insertedMarket.data) {
    throw new Error(`failed to create ${label} smoke market: ${insertedMarket.error?.message ?? 'unknown error'}`);
  }

  const insertedState = await adminDb.from('market_state').insert({
    market_id: insertedMarket.data.id,
    q_yes: 0,
    q_no: 0,
    yes_price: 0.5,
    no_price: 0.5,
    volume_total: 0,
    open_interest: 0,
    participants_count: 0
  });

  if (insertedState.error) {
    throw new Error(`failed to create ${label} market_state: ${insertedState.error.message}`);
  }

  return insertedMarket.data;
}

async function buildAuthCookie(email, password) {
  const cookieJar = new Map();
  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return Array.from(cookieJar.entries()).map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        for (const cookie of cookiesToSet) {
          cookieJar.set(cookie.name, cookie.value);
        }
      }
    }
  });

  const signIn = await supabase.auth.signInWithPassword({ email, password });
  if (signIn.error) {
    throw new Error(`failed to sign in ${email}: ${signIn.error.message}`);
  }

  const cookieHeader = Array.from(cookieJar.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');

  if (!cookieHeader) {
    throw new Error(`sign-in for ${email} produced no auth cookies`);
  }

  return cookieHeader;
}

async function requestJson(method, path, { body, cookie } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      accept: 'application/json',
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(cookie ? { cookie } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  let json = null;

  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  return { status: response.status, text, json };
}

function expectStatus(response, wanted, label) {
  if (response.status !== wanted) {
    const detail = response.json?.error ?? response.json?.detail ?? response.text;
    throw new Error(`${label} (http=${response.status}${detail ? `, detail=${detail}` : ''})`);
  }
}

function resolveServiceRoleKey() {
  const envValue = normalizeEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (envValue) return envValue;

  const projectRef = normalizeEnv(process.env.SUPABASE_PROJECT_REF) ?? parseProjectRefFromUrl(supabaseUrl);
  if (!projectRef) {
    throw new Error('missing SUPABASE_SERVICE_ROLE_KEY and could not derive SUPABASE_PROJECT_REF for CLI fallback');
  }

  const stdout = execFileSync('supabase', ['projects', 'api-keys', '--project-ref', projectRef, '-o', 'json'], {
    encoding: 'utf8'
  });
  const keys = JSON.parse(stdout);
  const legacyServiceRole = keys.find((entry) => entry?.id === 'service_role' && entry?.type === 'legacy' && typeof entry?.api_key === 'string');

  if (!legacyServiceRole?.api_key) {
    throw new Error('could not resolve service_role key from Supabase CLI');
  }

  return legacyServiceRole.api_key;
}

function parseProjectRefFromUrl(value) {
  try {
    return new URL(value).hostname.split('.')[0] ?? null;
  } catch {
    return null;
  }
}

function requiredEnv(name) {
  const value = normalizeEnv(process.env[name]);
  if (!value) {
    throw new Error(`missing required env: ${name}`);
  }
  return value;
}

function normalizeEnv(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === '""' || trimmed === "''") return null;
  return trimmed;
}

function expect(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function pass(message) {
  console.log(`PASS ${message}`);
}

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exit(1);
}
