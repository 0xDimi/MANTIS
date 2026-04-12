# Alpha Rebuild Track

Last updated: 2026-04-13 00:16 (Athens)

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
- [ ] Week 4, execute/ledger/portfolio/realtime
  - [x] rebuilt `/markets/[slug]` now has execute touchpoint (preview -> execute on live APIs)
  - [x] wallet/ledger/position reflection verified end-to-end through authenticated smoke
  - [x] rebuilt `/portfolio` now consumes live `/api/portfolio/summary` + `/api/trades/history`
  - [x] realtime update path added on rebuilt surfaces via 10s live polling
  - [ ] final manual multi-trade UI loop still pending before formal Week 4 close
- [ ] Week 5, admin lifecycle/resolution/settlement/audit
- [ ] Week 6, QA/telemetry/ops/runbook/launch readiness

## Active week
Week 4

## Active week remaining items
1. Run final manual multi-trade UI loop (buy + sell) on rebuilt routes and confirm expected ledger/portfolio reflection.
2. Keep markets unchanged until launch-readiness gate.

## Locked final-product requirement
- Users must be able to set and update their own nickname (profile display name).
- Keep this requirement in the product track and implement without breaking weekly plan sequencing.

## Next week tasks, once Week 3 is fully green
1. Trade execution endpoint closure on rebuilt flows.
2. Ledger writes + wallet updates verification.
3. Position updates + portfolio summary integration on rebuilt surfaces.
4. Realtime state update path verification.
5. Preserve the market-slate freeze while moving into Week 4 verification.
