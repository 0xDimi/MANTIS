# Alpha Live Status

Last updated: 2026-04-12 13:46 (Athens)

## Current phase
- Week 2 markets rebuild complete, Week 3 verification pass started

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
- `npm run build` passes after the Week 1 verification hardening
- Rebuild tracking doc added: `docs/ALPHA_REBUILD_TRACK.md`
- Week 2 lane committed: board/detail rebuilt on internal API read model (`a7667ff`)

## In progress
- Week 3 gate validation on rebuilt surfaces (quote/preview/expiry behavior)
- Slippage/depth and exposure-check verification against AMM source-of-truth
- Final-product requirement locked: users can set/update nickname

## Deferred by plan discipline
- Quote/trade ticket UI rebuild
- Portfolio live UI rebuild
- Admin/resolution/settlement UI work

## Latest verification result
- PASS for deployed magic-link flow after config fix
- PASS for first-login bootstrap: fresh tester record receives both `profiles` and `wallet_accounts` rows with expected default values

## Current blockers / needs
- No blocking issue on Week 1 auth path
- Primary focus is clean Week 2 execution without stage-skipping
