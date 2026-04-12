# Alpha Live Status

Last updated: 2026-04-12 13:11 (Athens)

## Current phase
- Week 1 verification pass is still active, but formal close is blocked until live magic links stop redirecting to localhost and land back in the deployed Next app

## Live build/run state
- Branch: `alpha`
- Build target: `npm run build`
- Canonical app: `https://xyz-labs-demo.vercel.app`
- Legacy assets: frozen in `public/legacy/*` as reference-only
- Active app surface: Next route shell (`/` and `/profile`) for Week 1 completion work
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

## In progress
- Re-test live invited-email magic-link flow after auth redirect config is corrected in Supabase
- Keep Week 2 market rebuild work paused until Week 1 is fully green

## Deferred by plan discipline
- Market board rebuild
- Market detail rebuild
- Quote/trade ticket UI rebuild
- Portfolio live UI rebuild
- Admin/resolution/settlement UI work

## Latest verification result
- FAIL for deployed magic-link landing path: fresh tester magic link resolved to `http://localhost:3000/#access_token=...` instead of the deployed callback/app surface, so the live Next session callback path did not complete on `xyz-labs-demo.vercel.app`
- PASS for first-login bootstrap: the same fresh tester record was created/confirmed in Supabase and had both `profiles` and `wallet_accounts` rows present with the expected default values

## Current blockers / needs
- Supabase Auth redirect/site URL configuration still points live magic-link landings at localhost, which blocks formal Week 1 closure
- After that config fix, rerun the invited tester flow on `https://xyz-labs-demo.vercel.app/profile` and confirm `/profile?auth=ok`
