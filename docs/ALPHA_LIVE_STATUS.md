# Alpha Live Status

Last updated: 2026-04-14 11:37 (EEST)

## Current phase
- Week 2 markets rebuild is complete
- Week 3 gate is fully closed
- Week 4 execution/ledger/portfolio/realtime gate is closed
- Week 5 admin/resolution/settlement gate is closed
- Week 6 QA/telemetry/ops/runbook/launch-readiness is active

## Live build/run state
- Branch: `alpha`
- Build target: `npm run build`
- Canonical app: `https://xyz-labs-demo.vercel.app`
- Legacy assets: frozen in `public/legacy/*` as reference-only
- Active app surface: rebuilt Next routes (`/markets`, `/markets/[slug]`, `/portfolio`, `/admin/*`)
- AMM source of truth: `xyz_amm_package_v0`

## Complete
- Week 0 through Week 5 gates are closed end-to-end on runtime
- Production settlement loop is validated for both resolved payout and VOID refund
- Full production smoke automation now exists in `scripts/qa-smoke-alpha.sh`
  - covers auth, markets, quote, execute, portfolio, history, admin lifecycle, resolution, settlement
- Week 6 admin smoke helper added: `scripts/qa-smoke-admin-pack.mjs`
  - isolated smoke fixtures
  - lifecycle `draft -> open -> paused -> open -> closed`
  - YES resolution + settlement payout
  - VOID resolution + settlement refund
  - public readback + post-settlement portfolio cleanup checks
- Repo hardening migration added: `0018_profile_update_guardrails.sql`
- Runtime hardening applied and verified:
  - `0018_profile_update_guardrails.sql` applied on active Supabase runtime
  - disposable-tester escalation probe now blocked (`profiles.role` self-promotion prevented)
- Telemetry SDK wiring implemented in app code:
  - Sentry client + server instrumentation files (`instrumentation-client.ts`, `instrumentation.ts`, `app/global-error.tsx`)
  - PostHog client initialization provider (`components/telemetry-provider.tsx`)

## Latest verification result
- PASS `npm run typecheck`
- PASS `npm run test:week3`
- PASS `npm run test:week5`
- PASS `npm run build`
- PASS production smoke (`./scripts/qa-smoke-alpha.sh`) on canonical app:
  - `/api/health`
  - `/api/markets`
  - `/api/me`
  - `/api/portfolio/summary`
  - `/api/quotes/preview`
  - `/api/trades/execute`
  - `/api/trades/history`
  - `/api/admin/markets/[marketId]/status`
  - `/api/admin/resolution`
  - `/api/admin/settlement`
  - `/api/markets/[slug]` resolution/settlement readback
- PASS production admin-pack smoke with RLS probe enabled (`SMOKE_VERIFY_PROFILE_RLS=1`)

## In progress
- Week 6 launch-readiness closeout
- Week 6 telemetry env setup + signal verification (Sentry/PostHog)
- Week 6 operator runbook finalization
- Final-product requirement remains locked: nickname update support

## Current blockers / needs
- Blocker: production telemetry envs + signal verification still pending
  - production telemetry envs not present in Vercel (`NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`)
  - end-to-end signal verification pending after env injection
- Primary focus remains launch readiness with no stage-skipping
