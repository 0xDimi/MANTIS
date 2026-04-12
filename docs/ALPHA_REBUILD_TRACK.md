# Alpha Rebuild Track

Last updated: 2026-04-12 12:30 (Athens)

## Principles
- Follow `docs/DELIVERY_PLAN_6_WEEKS.md` in order. No week skipping.
- `public/legacy/*` is frozen as UX reference only. Do not keep shipping product behavior from it.
- Server is authoritative for auth, wallet, market state, quotes, trades, and portfolio.
- `xyz_amm_package_v0` remains the AMM source of truth.
- Production-safe, incremental changes only.

## Architecture stance
- Next app routes become the real product surface.
- Supabase auth/session is the Week 1 foundation gate.
- Market, quote, trade, and portfolio APIs stay as server contracts, but later-week UI work is blocked until earlier weeks are fully closed.
- Legacy assets remain untouched for parity/reference checks during migration.

## Week-by-week status
- [x] Week 0, foundation shell, repo prep, baseline migrations
- [ ] Week 1, auth foundation is **active**
  - [x] core schema + first migrations in repo
  - [x] seed market candidates + wallet model defined
  - [x] app shell + route foundation exists in Next app
  - [x] root app surface moved back to Next shell, legacy kept reference-only
  - [x] email magic-link request UI added
  - [x] auth callback/session exchange route added
  - [x] signed-in profile + wallet visibility page added
  - [ ] live verification with real invited tester session still pending
- [ ] Week 2, markets list/detail DB-backed, rules/source panels, state wiring
  - APIs exist
  - product-grade route rebuild still intentionally blocked until Week 1 is closed
- [ ] Week 3, AMM v0 quote engine, slippage/depth, preview/expiry
  - backend largely present
  - no further UI execution until Weeks 1-2 are formally complete
- [ ] Week 4, execute/ledger/portfolio/realtime
  - backend pieces exist
  - out-of-sequence UI work paused
- [ ] Week 5, admin lifecycle/resolution/settlement/audit
- [ ] Week 6, QA/telemetry/ops/runbook/launch readiness

## Active week
Week 1

## Active week remaining items
1. Validate real invited-email magic-link flow end to end in the deployed app.
2. Confirm profile + wallet bootstrap land correctly after first session creation.
3. Close any auth callback/session persistence bugs found in that verification.

## Next week tasks, once Week 1 is fully green
1. Rebuild the market board route against `GET /api/markets`.
2. Rebuild market detail against `GET /api/markets/[slug]`.
3. Pull rules/source panels from DB-backed market data.
4. Add initial state/chart presentation from live market-state fields.
