# Alpha Live Status

Last updated: 2026-04-15 11:08 (EEST)

## Current phase
- Week 2 markets rebuild is complete
- Week 3 gate is fully closed
- Week 4 execution/ledger/portfolio/realtime gate is closed
- Week 5 admin/resolution/settlement gate is closed
- Week 6 QA/telemetry/ops/runbook/launch-readiness is closed
- Pre-UI simulation mode is active (2 open markets only, fast close windows today)

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
- PASS post-telemetry-wiring production regression rerun (`./scripts/qa-smoke-alpha.sh` + `SMOKE_VERIFY_PROFILE_RLS=1 node scripts/qa-smoke-admin-pack.mjs`)
- PASS `/api/health` telemetry readiness now reports full green for telemetry:
  - Sentry `envConfigured=true`, `sdkConfigured=true`
  - PostHog `envConfigured=true`, `sdkConfigured=true`

## In progress
- Resolution/settlement simulation pass on live runtime before UI polish
- Final-product requirement remains locked: nickname update support

## Simulation mode (active)
- Open markets reduced from 12 to 2 for fast-cycle verification:
  - `gre-weather-athens-heatwave` (close in ~1h from activation)
  - `gre-weather-thessaloniki-heavy-rain` (close in ~2h from activation)
- Simulation fee lowered to `50 bps` on both open markets (from `200 bps`) to reduce friction during rapid-cycle testing.
- Other launch-slate markets switched to `draft` (soft hide, not deleted)
- Immediate recheck after switch: PASS `qa-smoke-alpha` on production with `count=2`

## Ops runbook
- Operator runbook finalized: `docs/ALPHA_OPERATOR_RUNBOOK.md`

## Current blockers / needs
- No functional blockers from Week 6 remain.
- Active execution now: complete same-day simulation close -> resolution -> settlement checks, then start UI polish.
