# Alpha Operator Runbook

Last updated: 2026-04-14 21:24 (EEST)

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
- Markets slate unchanged unless explicit launch-slate window is opened
- Supabase migrations applied on runtime before deploy if schema changed
- No open red blockers in `docs/ALPHA_LIVE_STATUS.md`

## Deploy procedure (production)
```bash
cd side-project-os/prediction-market/demo
git push origin alpha
vercel deploy --prod --yes
```

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
