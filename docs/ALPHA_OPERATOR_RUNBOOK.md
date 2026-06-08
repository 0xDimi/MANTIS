# Alpha Operator Runbook

Last updated: 2026-06-08 14:40 (EEST)

## Scope
Operational playbook for xyz Labs alpha (`https://xyz-labs-demo.vercel.app`) while product remains in paper-trading mode.

## Launch-readiness gate (must all be green)
1. `npm run typecheck`
2. `npm run test:week3`
3. `npm run test:week5`
4. `npm run build`
5. `./scripts/qa-smoke-alpha.sh`
6. `SMOKE_VERIFY_PROFILE_RLS=1 node scripts/qa-smoke-admin-pack.mjs`
7. `/api/health` telemetry readiness reports env + SDK configured for Sentry/PostHog

## Pre-deploy checklist
- Branch is `alpha` and synced with `origin/alpha`
- Working tree is clean with no staged, unstaged, or untracked deploy-relevant files
- Markets slate unchanged unless explicit launch-slate window is opened
- Supabase migrations applied on runtime before deploy if schema changed
- New markets have matching Greek copy in `lib/market-copy.ts`
- No open red blockers in `docs/ALPHA_LIVE_STATUS.md`
- `npm run preflight:deploy` passes before any production push/deploy

## New-market localization gate
Any new market is incomplete until it passes both language readbacks:

```bash
curl -sS 'https://xyz-labs-demo.vercel.app/api/markets?scope=all&lang=en'
curl -sS 'https://xyz-labs-demo.vercel.app/api/markets?scope=all&lang=el'
```

Expected outcome:
- the new slug appears in both responses
- English copy appears under `lang=en`
- Greek copy appears under `lang=el`

If a market was inserted directly into live Supabase, deploy the app code containing the new `lib/market-copy.ts` slug entries before calling the market live.

## Deploy procedure (production)
```bash
cd side-project-os/prediction-market/demo
npm run deploy:prod
```

Hard rule:
- Never run `vercel deploy --prod` from the main workspace directly.
- Production deploys must ship from the clean worktree created by `scripts/deploy-alpha-prod.sh`.
- If `npm run preflight:deploy` fails because the repo is dirty or behind `origin/alpha`, stop and fix the repo state first instead of forcing a deploy.

## Post-deploy verification
```bash
curl -sS https://xyz-labs-demo.vercel.app/api/health | jq
./scripts/qa-smoke-alpha.sh
SMOKE_VERIFY_PROFILE_RLS=1 node scripts/qa-smoke-admin-pack.mjs
```

Expected outcomes:
- Health returns `status: ok`
- Trade + portfolio + admin lifecycle/resolution/settlement all PASS
- RLS self-promotion probe PASS

## Critical rollback conditions
Rollback immediately if any of these occur on production:
- `/api/health` not `ok`
- `/api/quotes/preview` fails for valid market/order
- `/api/trades/execute` fails for healthy auth session and valid quote hash
- Admin lifecycle/resolution/settlement path fails smoke checks

Rollback path:
1. Re-deploy last known good commit from `alpha`
2. Re-run post-deploy verification suite
3. Log incident + root cause in `docs/ALPHA_RUN_LOG.md`

## Incident triage (priority order)
1. **Auth/session failures** (`/api/me`, callback, profile)
2. **Quote/execute integrity** (hash mismatch, slippage guards, balance checks)
3. **Settlement correctness** (resolved payout and VOID refund)
4. **Telemetry blind spots** (Sentry/PostHog signal loss)

## Week 6 close criteria
- Telemetry SDK wiring: complete
- Telemetry envs present in Vercel production:
  - `NEXT_PUBLIC_SENTRY_DSN`
  - `NEXT_PUBLIC_POSTHOG_KEY`
  - `NEXT_PUBLIC_POSTHOG_HOST`
- Signal verification done after deploy
- Full regression rerun passes
