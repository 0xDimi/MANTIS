# Alpha Rebuild Track

Last updated: 2026-04-12 13:11 (Athens)

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
- [ ] Week 1, auth foundation is **active but blocked on live auth redirect config**
  - [x] core schema + first migrations in repo
  - [x] seed market candidates + wallet model defined
  - [x] app shell + route foundation exists in Next app
  - [x] root app surface moved back to Next shell, legacy kept reference-only
  - [x] email magic-link request UI added
  - [x] auth callback/session exchange route added
  - [x] signed-in profile + wallet visibility page added
  - [x] first-login profile + wallet bootstrap verified against a fresh tester record
  - [x] missing profile/wallet rows now self-heal via server-side bootstrap fallback (`/profile`, `/api/me`)
  - [ ] live invited tester session still does not land in deployed Next app because Supabase magic links are redirecting to `http://localhost:3000`
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
1. Fix Supabase Auth redirect configuration so magic links resolve to `https://xyz-labs-demo.vercel.app/auth/callback?next=%2Fprofile` instead of `http://localhost:3000`.
2. Re-run the invited-email magic-link flow on the canonical app and confirm it lands on `/profile?auth=ok` with a persisted session.
3. Keep Week 2 blocked until that live retest passes.

## Next week tasks, once Week 1 is fully green
1. Rebuild the market board route against `GET /api/markets`.
2. Rebuild market detail against `GET /api/markets/[slug]`.
3. Pull rules/source panels from DB-backed market data.
4. Add initial state/chart presentation from live market-state fields.
