#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

function clean(value) {
  return String(value ?? '').replace(/\\n/g, '').replace(/\n/g, '').trim();
}

function readEnv(path) {
  if (!fs.existsSync(path)) return {};
  const raw = fs.readFileSync(path, 'utf8');
  const env = {};

  for (const line of raw.split('\n')) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const [key, ...rest] = line.split('=');
    const value = rest.join('=').trim().replace(/^"|"$/g, '');
    env[key.trim()] = clean(value);
  }

  return env;
}

function mergeEnv(...items) {
  return items.reduce((acc, entry) => ({ ...acc, ...entry }), {});
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const cwd = process.cwd();
const env = mergeEnv(
  readEnv(`${cwd}/.env.local`),
  readEnv(`${cwd}/.env.runtime.pull`),
  readEnv(`${cwd}/.env.production.pull`),
  process.env
);

const supabaseUrl = clean(env.NEXT_PUBLIC_SUPABASE_URL);
const anonKey = clean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const appUrl = clean(env.NEXT_PUBLIC_APP_URL) || 'https://xyz-labs-demo.vercel.app';
const appOrigin = appUrl.replace(/\/$/, '');

assert(supabaseUrl, 'NEXT_PUBLIC_SUPABASE_URL missing');
assert(anonKey, 'NEXT_PUBLIC_SUPABASE_ANON_KEY missing');

let serviceKey = clean(env.SUPABASE_SERVICE_ROLE_KEY);

if (!serviceKey) {
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
  const keys = JSON.parse(
    execFileSync('supabase', ['projects', 'api-keys', '--project-ref', projectRef, '-o', 'json'], {
      encoding: 'utf8'
    })
  );

  serviceKey = clean(keys.find((entry) => entry?.id === 'service_role' && entry?.type === 'legacy')?.api_key);
}

assert(serviceKey, 'Unable to resolve SUPABASE_SERVICE_ROLE_KEY');

const admin = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const email = `qa.fresh.${Date.now()}@gmail.com`;
const password = `QaFresh!${crypto.randomBytes(4).toString('hex')}`;

const createResult = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: false,
  user_metadata: { full_name: 'QA Fresh User' }
});

if (createResult.error || !createResult.data.user) {
  throw new Error(`create user failed: ${createResult.error?.message ?? 'unknown error'}`);
}

const userId = createResult.data.user.id;

function createCookieJar() {
  const jar = new Map();

  return {
    jar,
    cookies: {
      getAll() {
        return Array.from(jar.entries()).map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        for (const cookie of cookiesToSet) {
          jar.set(cookie.name, cookie.value);
        }
      }
    },
    cookieHeader() {
      return Array.from(jar.entries())
        .map(([name, value]) => `${name}=${value}`)
        .join('; ');
    }
  };
}

async function generateMagicLink(redirectNext = '/profile?invite=1') {
  const redirectTo = `${appOrigin}/auth/callback?next=${encodeURIComponent(redirectNext)}`;

  const generated = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo }
  });

  if (generated.error || !generated.data?.properties?.action_link) {
    throw new Error(`generate magic link failed: ${generated.error?.message ?? 'missing action link'}`);
  }

  const props = generated.data.properties;
  return {
    redirectTo,
    actionLink: props.action_link,
    emailOtp: props.email_otp,
    hashedToken: props.hashed_token
  };
}

async function loginWithMagicLinkOtp(emailOtp) {
  const cookieJar = createCookieJar();
  const browserClient = createServerClient(supabaseUrl, anonKey, {
    cookies: cookieJar.cookies
  });

  const verify = await browserClient.auth.verifyOtp({
    email,
    token: emailOtp,
    type: 'email'
  });

  if (verify.error) {
    throw new Error(`verifyOtp failed: ${verify.error.message}`);
  }

  return cookieJar;
}

async function apiGet(path, cookieHeader) {
  const response = await fetch(`${appOrigin}${path}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    cache: 'no-store'
  });
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

async function apiPost(path, payload, cookieHeader) {
  const response = await fetch(`${appOrigin}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(cookieHeader ? { cookie: cookieHeader } : {})
    },
    body: JSON.stringify(payload)
  });
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

const checks = [];

const firstLink = await generateMagicLink('/profile?invite=1');
const redirectHost = new URL(firstLink.redirectTo).host;
const actionUrl = new URL(firstLink.actionLink);
const actionRedirect = clean(actionUrl.searchParams.get('redirect_to'));

checks.push({
  check: 'magic link redirect target uses production app host',
  pass: Boolean(actionRedirect) && new URL(actionRedirect).host === redirectHost,
  detail: {
    redirectHost,
    actionRedirectHost: actionRedirect ? new URL(actionRedirect).host : null,
    actionLinkHost: actionUrl.host
  }
});

assert(firstLink.emailOtp, 'magic link email OTP missing from generated link');
const firstSession = await loginWithMagicLinkOtp(firstLink.emailOtp);
const authCookie = firstSession.cookieHeader();
assert(authCookie, 'No auth cookies after magic link verification');

const meAfterSignup = await apiGet('/api/me', authCookie);
checks.push({
  check: 'email login / magic link works',
  pass: meAfterSignup.response.ok && Boolean(meAfterSignup.body?.user?.id),
  detail: {
    status: meAfterSignup.response.status,
    userId: meAfterSignup.body?.user?.id ?? null
  }
});

checks.push({
  check: 'user profile is created',
  pass: Boolean(meAfterSignup.body?.user?.profile?.user_id || meAfterSignup.body?.user?.profile?.id),
  detail: {
    profileId: meAfterSignup.body?.user?.profile?.id ?? null
  }
});

const walletRows = await admin
  .from('wallet_accounts')
  .select('id,starting_balance,currency', { count: 'exact' })
  .eq('user_id', userId);

checks.push({
  check: 'paper wallet is seeded exactly once',
  pass:
    !walletRows.error &&
    Number(walletRows.count ?? 0) === 1 &&
    Number(walletRows.data?.[0]?.starting_balance ?? 0) === 1000 &&
    walletRows.data?.[0]?.currency === 'PAPER_EUR',
  detail: {
    count: walletRows.count ?? null,
    startingBalance: walletRows.data?.[0]?.starting_balance ?? null,
    currency: walletRows.data?.[0]?.currency ?? null,
    error: walletRows.error?.message ?? null
  }
});

const portfolioBeforeTrades = await apiGet('/api/portfolio/summary', authCookie);
checks.push({
  check: 'portfolio starts clean',
  pass:
    portfolioBeforeTrades.response.ok &&
    Array.isArray(portfolioBeforeTrades.body?.positions) &&
    portfolioBeforeTrades.body.positions.length === 0,
  detail: {
    status: portfolioBeforeTrades.response.status,
    positions: Array.isArray(portfolioBeforeTrades.body?.positions)
      ? portfolioBeforeTrades.body.positions.length
      : null
  }
});

const setLang = await apiPost('/api/preferences/lang', { lang: 'el' }, authCookie);
const meAfterLang = await apiGet('/api/me', authCookie);
checks.push({
  check: 'language preference persists',
  pass: setLang.response.ok && meAfterLang.body?.user?.profile?.locale === 'el',
  detail: {
    updateStatus: setLang.response.status,
    locale: meAfterLang.body?.user?.profile?.locale ?? null
  }
});

const marketsRes = await apiGet('/api/markets', authCookie);
const openMarket = Array.isArray(marketsRes.body?.markets)
  ? marketsRes.body.markets.find((entry) => entry?.status === 'open')
  : null;
assert(openMarket?.id, 'No open market for trading test');

let sessionStable = true;
let sessionFailure = null;

for (let i = 0; i < 6; i += 1) {
  const quote = await apiPost(
    '/api/quotes/preview',
    {
      marketId: openMarket.id,
      side: 'yes',
      action: 'buy',
      amountEur: 10 + i
    },
    authCookie
  );

  if (quote.response.status === 401 || !quote.response.ok) {
    sessionStable = false;
    sessionFailure = {
      stage: 'quote',
      iteration: i + 1,
      status: quote.response.status,
      body: quote.body
    };
    break;
  }

  const execution = await apiPost(
    '/api/trades/execute',
    {
      marketId: openMarket.id,
      side: 'yes',
      action: 'buy',
      amountEur: 10 + i,
      quoteHash: quote.body.quoteHash,
      quoteExpiresAt: quote.body.expiresAt
    },
    authCookie
  );

  if (execution.response.status === 401 || !execution.response.ok) {
    sessionStable = false;
    sessionFailure = {
      stage: 'trade',
      iteration: i + 1,
      status: execution.response.status,
      body: execution.body
    };
    break;
  }

  await wait(5_000);
}

checks.push({
  check: 'session does not randomly expire during trading',
  pass: sessionStable,
  detail: sessionFailure
});

const serverClientForLogout = createServerClient(supabaseUrl, anonKey, {
  cookies: firstSession.cookies
});
const signOutResult = await serverClientForLogout.auth.signOut();
if (signOutResult.error) {
  throw new Error(`logout failed: ${signOutResult.error.message}`);
}

const meAfterLogout = await apiGet('/api/me', firstSession.cookieHeader());

const secondLink = await generateMagicLink('/profile');
assert(secondLink.emailOtp, 'second magic link email OTP missing');
const secondSession = await loginWithMagicLinkOtp(secondLink.emailOtp);
const meAfterRelogin = await apiGet('/api/me', secondSession.cookieHeader());

const logoutStateIsSignedOut =
  meAfterLogout.response.status === 401 ||
  (meAfterLogout.response.ok && meAfterLogout.body?.user === null);

checks.push({
  check: 'user can log out and back in',
  pass: logoutStateIsSignedOut && meAfterRelogin.response.ok && meAfterRelogin.body?.user?.id === userId,
  detail: {
    logoutStatus: meAfterLogout.response.status,
    logoutBody: meAfterLogout.body,
    reloginStatus: meAfterRelogin.response.status,
    reloginUserId: meAfterRelogin.body?.user?.id ?? null
  }
});

checks.push({
  check: 'language persists after relogin',
  pass: meAfterRelogin.body?.user?.profile?.locale === 'el',
  detail: {
    locale: meAfterRelogin.body?.user?.profile?.locale ?? null
  }
});

const summary = {
  appOrigin,
  userId,
  email,
  checks,
  passed: checks.filter((item) => item.pass).length,
  failed: checks.filter((item) => !item.pass).length
};

console.log(JSON.stringify(summary, null, 2));

if (summary.failed > 0) {
  process.exitCode = 1;
}
