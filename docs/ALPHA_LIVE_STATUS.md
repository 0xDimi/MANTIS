# Alpha Live Status

Last updated: 2026-04-13 00:40 (Athens)

## Current phase
- Week 2 markets rebuild is complete
- Week 3 gate is fully closed (API hardening + rebuilt preview surface + authenticated smoke rerun)
- Week 4 execution/ledger/portfolio/realtime gate is closed
- Week 5 admin/resolution/settlement pass is now active

## Live build/run state
- Branch: `alpha`
- Build target: `npm run build`
- Canonical app: `https://xyz-labs-demo.vercel.app`
- Legacy assets: frozen in `public/legacy/*` as reference-only
- Active app surface: rebuilt Next routes for `/markets` and `/markets/[slug]` are live in code
- AMM source of truth: `xyz_amm_package_v0`

## Complete
- Week 0 repo/app/migration foundation is in place
- Supabase auth SSR client wiring exists
- Core schema, wallet model, seed pack, and route scaffold exist
- Root app no longer mounts the legacy prototype as live product behavior
- Email magic-link request UI added to `/profile`
- Auth callback/session exchange route added at `/auth/callback`
- Signed-in profile and wallet visibility added to `/profile`
- Fresh tester bootstrap verified: new auth user received `profiles` + `wallet_accounts` rows with the default `PAPER_EUR` €1,000 balance
- Missing profile/wallet rows now self-heal from server-side bootstrap fallback in `/profile` and `/api/me`
- Rebuild tracking doc added: `docs/ALPHA_REBUILD_TRACK.md`
- Week 2 lane committed: board/detail rebuilt on internal API read model (`a7667ff`)
- Week 3 API hardening landed on `POST /api/quotes/preview` and `POST /api/trades/execute`
  - invalid `side` / `action` values now fail before repricing or execution
  - quote expiry is capped by market `close_time`
  - preview + execute both reject trading after `close_time` even if status has not flipped yet
  - execute now mirrors exposure/share-availability checks before the SQL RPC
- Deterministic Week 3 guardrail tests added and passing via `npm run test:week3`
- Rebuilt market detail now includes live quote preview + expiry interaction card (client flow on `/markets/[slug]`)
- `npm run typecheck` passes
- `npm run build` passes
- Canonical no-auth smoke passes on deployed app for `/api/health`, `/api/markets`, and `/api/quotes/preview`
- Authenticated production smoke passes for `/api/me`, `/api/portfolio/summary`, `/api/trades/execute`, and `/api/trades/history`
- Trade execution RPC parity restored on remote DB by applying idempotent signature migration (`0011_trade_execution_idempotency.sql`)
- Market-state LMSR drift corrected on remote DB (`0013_realign_market_state_prices_with_lmsr.sql`)
- Rebuilt `/admin/markets` now exposes live lifecycle controls for `draft` / `open` / `paused` / `closed`
- Rebuilt `/admin/resolution` now exposes a YES / NO / VOID queue with evidence capture
- Week 5 runtime migration applied on active Supabase (`0014_week5_admin_resolution_ops.sql`)
- Admin write-path smoke pass completed on production (status transitions + VOID resolution + public readback)
- Public market detail read model now includes recorded resolution metadata when present

## In progress
- Week 5 gate: first admin lifecycle + resolution increment is in code, with settlement/settled-state still open
- Final-product requirement locked: users can set/update nickname
- Build-plan-first execution: market-content changes paused until pre-launch readiness gate
- Week 4 rebuilt-surface pass now includes live execute interaction on `/markets/[slug]` and live portfolio/trade reflection on `/portfolio`

## Deferred by plan discipline
- Quote/trade ticket UI rebuild
- Portfolio live UI rebuild
- Settlement engine + settled-state UI work

## Latest verification result
- PASS `npm run typecheck`
- PASS `npm run test:week3`
- PASS `npm run test:week5`
- PASS `npm run build`
- PASS rebuilt Week 5 surfaces in code: `/admin/markets` lifecycle controls, `/admin/resolution` YES/NO/VOID queue, public `/markets/[slug]` resolution readback
- PASS production admin write-path smoke: `POST /api/admin/markets/[marketId]/status` and `POST /api/admin/resolution` (VOID path) with resolved readback on `/api/markets/[slug]`
- PASS deployed no-auth smoke for `/api/health`, `/api/markets`, `/api/quotes/preview`
- PASS deployed auth smoke for `/api/me`, `/api/portfolio/summary`, `/api/trades/execute`, `/api/trades/history`
- PASS rebuilt route integration: quote preview + execute touchpoint visible on `/markets/[slug]`, live portfolio panel wired on `/portfolio`
- PASS multi-trade loop (buy + sell) with expected wallet/position/trade-history reflection
- Historical PASS remains on first-login bootstrap: fresh tester record receives both `profiles` and `wallet_accounts` rows with expected default values

## Current blockers / needs
- No blocking issue on Week 1 auth path
- No active blocker on Week 3 closure criteria
- No active blocker on Week 4 closure criteria
- Week 5 admin lifecycle/resolution increment is operational on runtime
- Settlement engine and settled-state payout/void-refund verification are still open
- Primary focus remains operational stability and launch readiness without stage-skipping
