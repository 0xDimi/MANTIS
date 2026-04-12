# Alpha Rebuild Track

Last updated: 2026-04-13 01:06 (Athens)

## Principles
- Follow `docs/DELIVERY_PLAN_6_WEEKS.md` in order. No week skipping.
- `public/legacy/*` is frozen as UX reference only. Do not keep shipping product behavior from it.
- Server is authoritative for auth, wallet, market state, quotes, trades, and portfolio.
- `xyz_amm_package_v0` remains the AMM source of truth.
- Production-safe, incremental changes only.
- Market content/slate decisions are frozen during build weeks and only finalized at pre-launch readiness.

## Architecture stance
- Next app routes become the real product surface.
- Supabase auth/session is the Week 1 foundation gate.
- Market, quote, trade, and portfolio APIs stay as server contracts, but later-week UI work is blocked until earlier weeks are fully closed.
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
  - [x] multi-trade execution loop (buy + sell) verified with expected wallet/position/trade-history reflections
- [x] Week 5, admin lifecycle/resolution/settlement/audit
  - [x] rebuilt `/admin/markets` now reads live market rows and exposes admin-only lifecycle controls for `draft` / `open` / `paused` / `closed`
  - [x] secure lifecycle write route added at `POST /api/admin/markets/[marketId]/status`
  - [x] lifecycle writes now validate allowed transitions before mutating and record audit-safe status changes via new SQL helper migration `0014_week5_admin_resolution_ops.sql`
  - [x] rebuilt `/admin/resolution` now shows the closeout queue and records `YES` / `NO` / `VOID` with evidence summary + optional source URL
  - [x] secure resolution write route added at `POST /api/admin/resolution`
  - [x] public market detail route now returns recorded resolution metadata so rebuilt `/markets/[slug]` can reflect outcome/evidence once a market is resolved
  - [x] deterministic Week 5 guardrail coverage added via `npm run test:week5`
  - [x] migration `0014_week5_admin_resolution_ops.sql` applied on active runtime
  - [x] production admin smoke verified for status transitions + VOID resolution + readback metadata
  - [x] secure settlement write route added at `POST /api/admin/settlement`
  - [x] repo migration `0016_week5_settlement_engine.sql` added for one-shot settlement writes, wallet/ledger adjustments, idempotent `market_settlements`, and audit-safe `market_settlement_entries`
  - [x] payout / void-refund ledger path implemented for resolved and void markets with settled-state readback on rebuilt admin/public surfaces
  - [x] deterministic settlement coverage added to `npm run test:week5`
  - [x] runtime migration `0016_week5_settlement_engine.sql` application on active runtime
  - [x] runtime fix migration `0017_fix_admin_settlement_market_id_ambiguity.sql` applied after production smoke surfaced PL/pgSQL ambiguity
  - [x] operator smoke passed on migrated runtime for resolved payout + VOID refund paths (wallet/ledger/position reflections + settled readback)
- [ ] Week 6, QA/telemetry/ops/runbook/launch readiness

## Active week
Week 6

## Active week remaining items
1. Add launch-readiness QA + telemetry checks and finalize operator runbook for incident/rollback handling.
2. Execute full production smoke pack covering auth, markets, quote, execute, portfolio, admin lifecycle, resolution, and settlement paths.
3. Keep markets unchanged until launch-readiness gate.

## Locked final-product requirement
- Users must be able to set and update their own nickname (profile display name).
- Keep this requirement in the product track and implement without breaking weekly plan sequencing.

## Next week tasks, once Week 3 is fully green
1. Trade execution endpoint closure on rebuilt flows.
2. Ledger writes + wallet updates verification.
3. Position updates + portfolio summary integration on rebuilt surfaces.
4. Realtime state update path verification.
5. Preserve the market-slate freeze while moving into Week 4 verification.
