# Alpha Rebuild Track

Last updated: 2026-04-14 01:08 (EEST)

## Principles
- Follow `docs/DELIVERY_PLAN_6_WEEKS.md` in order. No week skipping.
- `public/legacy/*` is frozen as UX reference only. Do not keep shipping product behavior from it.
- Server is authoritative for auth, wallet, market state, quotes, trades, portfolio, and admin actions.
- `xyz_amm_package_v0` remains the AMM source of truth.
- Production-safe, incremental changes only.
- Market content/slate decisions stay frozen until launch-readiness is explicitly closed.

## Architecture stance
- Next app routes are the real product surface.
- Supabase auth/session is the foundation gate.
- Market, quote, trade, portfolio, lifecycle, resolution, and settlement APIs remain server contracts.
- Legacy assets remain untouched for parity/reference checks during migration.

## Week-by-week status
- [x] Week 0, foundation shell, repo prep, baseline migrations
- [x] Week 1, auth foundation
  - [x] core schema + first migrations in repo
  - [x] seed market candidates + wallet model defined
  - [x] app shell + route foundation exists in Next app
  - [x] root app surface moved back to Next shell, legacy kept reference-only
  - [x] email magic-link request UI added
  - [x] auth callback/session exchange route added
  - [x] signed-in profile + wallet visibility page added
  - [x] first-login profile + wallet bootstrap verified against a fresh tester record
  - [x] missing profile/wallet rows now self-heal via server-side bootstrap fallback (`/profile`, `/api/me`)
  - [x] live invited tester magic-link flow verified on deployed app
- [x] Week 2, markets list/detail DB-backed, rules/source panels, state wiring
  - [x] `/markets` rebuilt against `GET /api/markets`
  - [x] `/markets/[slug]` rebuilt against `GET /api/markets/[slug]`
  - [x] rules/source panels now DB-backed (`source_primary`, `source_fallback`, `void_rule`)
  - [x] initial live state/chart presentation added from market state fields
- [x] Week 3, AMM v0 quote engine, slippage/depth, preview/expiry
  - [x] quote preview remains SoT-aligned with `xyz_amm_package_v0`
  - [x] preview/execute now reject invalid trade enums before repricing or execution
  - [x] quote expiry is capped by market `close_time`
  - [x] preview/execute reject trading after `close_time` even if market status lags
  - [x] execute mirrors exposure/share-availability checks before the SQL RPC
  - [x] deterministic guardrail coverage added via `npm run test:week3`
  - [x] deployed no-auth smoke verified for `/api/health`, `/api/markets`, `/api/quotes/preview`
  - [x] rebuilt `/markets/[slug]` now exposes Week 3 quote preview + expiry interaction (`POST /api/quotes/preview`)
  - [x] authenticated execute/portfolio/history smoke rerun passes on production via temporary smoke tester provisioning
- [x] Week 4, execute/ledger/portfolio/realtime
  - [x] rebuilt `/markets/[slug]` now has execute touchpoint (preview -> execute on live APIs)
  - [x] wallet/ledger/position reflection verified end-to-end through authenticated smoke
  - [x] rebuilt `/portfolio` now consumes live `/api/portfolio/summary` + `/api/trades/history`
  - [x] realtime update path added on rebuilt surfaces via 10s live polling
  - [x] multi-trade execution loop verified with expected wallet/position/trade-history reflections
- [x] Week 5, admin lifecycle/resolution/settlement/audit
  - [x] rebuilt `/admin/markets` reads live market rows and exposes admin-only lifecycle controls for `draft` / `open` / `paused` / `closed`
  - [x] secure lifecycle write route exists at `POST /api/admin/markets/[marketId]/status`
  - [x] lifecycle writes validate transitions and record audit-safe status changes through `0014_week5_admin_resolution_ops.sql`
  - [x] rebuilt `/admin/resolution` records `YES` / `NO` / `VOID` with evidence summary + optional source URL
  - [x] secure resolution write route exists at `POST /api/admin/resolution`
  - [x] public market detail returns recorded resolution metadata for rebuilt `/markets/[slug]`
  - [x] deterministic Week 5 guardrail coverage added via `npm run test:week5`
  - [x] runtime migrations `0014`, `0016`, and `0017` applied on active Supabase
  - [x] production admin smoke verified for status transitions, resolution, settlement, and readback metadata
- [ ] Week 6, QA/telemetry/ops/runbook/launch readiness
  - [x] Full production smoke pack automated in `scripts/qa-smoke-alpha.sh`
  - [x] Week 6 admin helper added in `scripts/qa-smoke-admin-pack.mjs`
  - [x] Production smoke rerun completed on the canonical app for auth, markets, quote, execute, portfolio, admin lifecycle, resolution, and settlement
  - [x] Smoke pack docs updated in `docs/QA_SMOKE.md`
  - [x] Repo readiness visibility improved in `app/api/health/route.ts`
  - [x] Repo security hardening added in `supabase/migrations/0018_profile_update_guardrails.sql`
  - [x] Production telemetry/readiness audit completed
  - [ ] Apply `0018_profile_update_guardrails.sql` on live Supabase and rerun the RLS escalation probe
  - [ ] Add real Sentry SDK wiring plus production envs
  - [ ] Add real PostHog SDK wiring plus production envs
  - [ ] Deploy and verify the richer Week 6 `/api/health` readiness payload on the canonical app

## Active week
Week 6

## Active week remaining items
1. Apply `0018_profile_update_guardrails.sql` on the live Supabase runtime and confirm self-promotion is blocked.
2. Wire Sentry in code and set the required production env.
3. Wire PostHog in code and set the required production env.
4. Redeploy and verify the readiness-enhanced `GET /api/health` payload on the canonical app.
5. Close Week 6 only after the security + telemetry blockers are cleared.

## Locked final-product requirement
- Users must be able to set and update their own nickname (profile display name).
- Keep this requirement in the product track and implement without breaking week-order discipline.

## Immediate next actions after this pass
1. Apply the profile guardrail migration to runtime.
2. Re-run the disposable RLS escalation probe and full production smoke pack.
3. Land telemetry wiring and envs.
4. Re-check the canonical app health/readiness payload.
5. Only then close Week 6.
