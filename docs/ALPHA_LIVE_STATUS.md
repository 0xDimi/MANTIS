# Alpha Live Status

Last updated: 2026-04-14 01:08 (EEST)

## Current phase
- Week 2 markets rebuild is complete
- Week 3 gate is fully closed
- Week 4 execution/ledger/portfolio/realtime gate is closed
- Week 5 admin/resolution/settlement gate is closed
- Week 6 QA/telemetry/ops/runbook/launch-readiness is still active
- Week 6 production smoke coverage is now complete, but launch-readiness is not closed because telemetry and runtime security blockers remain

## Live build/run state
- Branch: `alpha`
- Build target: `npm run build`
- Canonical app: `https://xyz-labs-demo.vercel.app`
- Legacy assets: frozen in `public/legacy/*` as reference-only
- Active app surface: rebuilt Next routes remain the product surface in code
- AMM source of truth: `xyz_amm_package_v0`

## Complete
- Week 0 through Week 5 gates remain closed
- Full production smoke automation now lives in `scripts/qa-smoke-alpha.sh`
  - auth
  - markets
  - quote
  - execute
  - portfolio
  - admin lifecycle
  - resolution
  - settlement
- New helper added: `scripts/qa-smoke-admin-pack.mjs`
  - provisions isolated smoke users and smoke-only markets
  - runs lifecycle `draft -> open -> paused -> open -> closed`
  - runs resolved payout settlement and VOID refund settlement
  - verifies public readback plus post-settlement portfolio cleanup
  - resolves `SUPABASE_SERVICE_ROLE_KEY` from env or Supabase CLI fallback
- `docs/QA_SMOKE.md` updated to match the full Week 6 smoke pack
- Repo hardening patch added: `supabase/migrations/0018_profile_update_guardrails.sql`
  - blocks authenticated profile self-promotion on `profiles.role`
  - keeps `user_id` / `created_at` immutable on self-writes
- Repo readiness patch added: `app/api/health/route.ts`
  - now exposes readiness booleans for Supabase env presence
  - now exposes telemetry env booleans for Sentry/PostHog
  - still reports `sdkConfigured: false` because no telemetry wiring exists yet
- Full production smoke pass completed on the canonical app using isolated smoke fixtures
- Smoke cleanup verified: no open/public `[SMOKE]` markets remained in `/api/markets`

## Latest verification result
- PASS `npm run typecheck`
- PASS `npm run test:week3`
- PASS `npm run test:week5`
- PASS `npm run build`
- PASS live production smoke for:
  - `GET /api/health`
  - `GET /api/markets`
  - `GET /api/me`
  - `GET /api/portfolio/summary`
  - `POST /api/quotes/preview`
  - `POST /api/trades/execute`
  - `GET /api/trades/history`
  - `POST /api/admin/markets/[marketId]/status`
  - `POST /api/admin/resolution`
  - `POST /api/admin/settlement`
  - `GET /api/markets/[slug]` resolution/settlement readback
- PASS live lifecycle smoke: `alpha-smoke-lifecycle-20260413220507-1f484c`
- PASS live resolved-payout smoke: `alpha-smoke-settle-yes-20260413220507-1f484c`
- PASS live VOID-refund smoke: `alpha-smoke-settle-void-20260413220507-1f484c`
- PASS live settlement reflection:
  - payout trader wallet `995.00 -> 1004.57`
  - void trader wallet `995.00 -> 1000.00`
- PASS production env audit: Vercel production currently exposes only
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- PASS code audit: no runtime Sentry/PostHog wiring found in app code beyond docs/example env references
- FAIL runtime security probe: authenticated disposable tester was able to update `profiles.role` from `tester` to `admin` on live Supabase before cleanup/revert

## In progress
- Week 6 launch-readiness closeout
- Telemetry/readiness implementation beyond env visibility
- Runtime application of the new profile guardrail migration

## Current blockers / needs
- Blocker: live runtime still has no actual Sentry wiring
  - no production `NEXT_PUBLIC_SENTRY_DSN`
  - no app SDK/instrumentation files present
- Blocker: live runtime still has no actual PostHog wiring
  - no production `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST`
  - no app SDK usage present
- Blocker: live `GET /api/health` currently exposes only static app metadata on the deployed app; the richer readiness payload exists in branch code and still needs deployment verification
- Blocker: live Supabase RLS still allows self-promotion through `profiles.role`
  - confirmed with a disposable tester probe
  - repo fix exists in `0018_profile_update_guardrails.sql`
  - runtime migration still needs to be applied and re-verified
