# Alpha Rebuild Track

Last updated: 2026-04-15 12:01 (EEST)

## Principles
- Follow `docs/DELIVERY_PLAN_6_WEEKS.md` in order. No week skipping.
- `public/legacy/*` is frozen as UX reference only. Do not keep shipping product behavior from it.
- Server is authoritative for auth, wallet, market state, quotes, trades, and portfolio.
- `xyz_amm_package_v0` remains the AMM source of truth.
- Production-safe, incremental changes only.
- Market content/slate decisions are frozen during build weeks and only finalized at pre-launch readiness.

## Architecture stance
- Next app routes are the product surface.
- Supabase auth/session is the Week 1 foundation gate.
- Market, quote, trade, and portfolio APIs remain server contracts.
- Legacy assets remain reference-only for parity checks.

## Week-by-week status
- [x] Week 0, foundation shell, repo prep, baseline migrations
- [x] Week 1, auth foundation
- [x] Week 2, markets list/detail DB-backed, rules/source panels, state wiring
- [x] Week 3, AMM v0 quote engine, slippage/depth, preview/expiry
- [x] Week 4, execute/ledger/portfolio/realtime
- [x] Week 5, admin lifecycle/resolution/settlement/audit
- [x] Week 6, QA/telemetry/ops/runbook/launch readiness
  - [x] Full production smoke automation consolidated in `scripts/qa-smoke-alpha.sh`
  - [x] Admin lifecycle/resolution/settlement smoke helper added in `scripts/qa-smoke-admin-pack.mjs`
  - [x] Production smoke pass completed on canonical app (auth + trade + admin + settlement)
  - [x] Repo migration added: `0018_profile_update_guardrails.sql`
  - [x] Runtime migration `0018_profile_update_guardrails.sql` applied on active Supabase
  - [x] RLS verification pass: disposable tester cannot self-promote `profiles.role` to admin
  - [x] Telemetry wiring implementation (Sentry/PostHog)
  - [x] Post-telemetry-wiring production regression rerun (full smoke + admin pack + RLS probe)
  - [x] Production telemetry env setup and verification (`NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` + redeploy + health check)
  - [x] Operator runbook finalization (`docs/ALPHA_OPERATOR_RUNBOOK.md`)

## Active week
Post-Week-6 execution phase

## Active week remaining items
1. Run pre-UI two-market simulation cycle (same-day close + resolution + settlement verification).
2. Immediately start UI polish pass after simulation signoff (no backend contract drift).
   - Ship production-looking UI only (no demo/testing/rebuild hints in visible copy).
   - Mobile optimization required across core routes before launch.
   - Initial mobile UX block implemented on `alpha` (`3101d98`): two-card featured swipe, category strip, bottom nav Home/Portfolio/More, and `/more` explainer route.
3. Post-UI (pre-launch): run tester activation walkthrough ("first trade") and validate onboarding conversion.
4. Keep launch-slate expansion deferred until launch-design window opens.

## Temporary simulation override (approved)
- Runtime market slate is intentionally reduced to 2 open markets for fast-cycle operations testing today.
- Remaining launch-slate markets are set to `draft` (soft hidden, recoverable), not deleted.
- Purpose: accelerate real-runtime validation of close-time behavior, admin resolution, settlement payout/refund, and portfolio reflection before UI pass.

## Post Week 6 lock (confirmed)
1. UI polish pass (no backend contract drift).
2. Launch market design/final slate.
3. Domain setup + cutover checks.
4. Controlled automated trading ops (rules-based, not random blanket bots).
5. Tester activation run with first-trade walkthrough.

## Locked final-product requirement
- Users must be able to set and update their own nickname (profile display name).
- Keep this requirement in the product track without breaking weekly sequencing.
