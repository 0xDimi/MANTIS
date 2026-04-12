# Alpha Live Status

Last updated: 2026-04-12 14:52 (Athens)

## Current phase
- Week 2 markets rebuild is complete
- Week 3 API hardening and deterministic verification are complete
- Week 3 rebuilt-surface closure is still open because `/markets/[slug]` does not yet expose a rebuilt quote preview/ticket flow

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
- `npm run typecheck` passes
- `npm run build` passes
- Canonical no-auth smoke passes on deployed app for `/api/health`, `/api/markets`, and `/api/quotes/preview`

## In progress
- Week 3 rebuilt-surface closure on `/markets/[slug]` (the page is still read-only and does not yet render a rebuilt quote preview/ticket flow)
- Authenticated execution smoke re-run for `/api/me`, `/api/portfolio/summary`, `/api/trades/execute`, and `/api/trades/history`
- Final-product requirement locked: users can set/update nickname
- Build-plan-first execution: market-content changes paused until pre-launch readiness gate

## Deferred by plan discipline
- Quote/trade ticket UI rebuild
- Portfolio live UI rebuild
- Admin/resolution/settlement UI work

## Latest verification result
- PASS `npm run typecheck`
- PASS `npm run test:week3`
- PASS `npm run build`
- PASS deployed no-auth smoke for `/api/health`, `/api/markets`, `/api/quotes/preview`
- Historical PASS remains on first-login bootstrap: fresh tester record receives both `profiles` and `wallet_accounts` rows with expected default values

## Current blockers / needs
- No blocking issue on Week 1 auth path
- Full auth-only smoke was not rerun from this session because no smoke tester credentials or prebuilt auth cookie were injected
- Week 3 cannot be called fully closed on rebuilt product surfaces until `/markets/[slug]` exposes the rebuilt quote preview/expiry interaction
- Primary focus remains operational stability and launch readiness without stage-skipping
