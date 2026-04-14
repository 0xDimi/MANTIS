# Alpha Rebuild Track

Last updated: 2026-04-14 11:41 (EEST)

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
- [ ] Week 6, QA/telemetry/ops/runbook/launch readiness
  - [x] Full production smoke automation consolidated in `scripts/qa-smoke-alpha.sh`
  - [x] Admin lifecycle/resolution/settlement smoke helper added in `scripts/qa-smoke-admin-pack.mjs`
  - [x] Production smoke pass completed on canonical app (auth + trade + admin + settlement)
  - [x] Repo migration added: `0018_profile_update_guardrails.sql`
  - [x] Runtime migration `0018_profile_update_guardrails.sql` applied on active Supabase
  - [x] RLS verification pass: disposable tester cannot self-promote `profiles.role` to admin
  - [x] Telemetry wiring implementation (Sentry/PostHog)
  - [x] Post-telemetry-wiring production regression rerun (full smoke + admin pack + RLS probe)
  - [ ] Production telemetry env setup and verification
  - [ ] Operator runbook finalization

## Active week
Week 6

## Active week remaining items
1. Add production telemetry envs and verify signal flow.
2. Finalize runbook + launch-readiness checks.
3. Keep markets unchanged until launch-readiness gate.

## Post Week 6 lock (confirmed)
1. UI polish pass (no backend contract drift).
2. Launch market design/final slate.
3. Domain setup + cutover checks.
4. Founder end-to-end manual trade run.

## Locked final-product requirement
- Users must be able to set and update their own nickname (profile display name).
- Keep this requirement in the product track without breaking weekly sequencing.
