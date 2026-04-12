# Alpha Live Status

Last updated: 2026-04-12 12:30 (Athens)

## Current phase
- Week 1 completion pass, closing auth foundation before any Week 2+ route rebuild work continues

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
- Rebuild tracking doc added: `docs/ALPHA_REBUILD_TRACK.md`

## In progress
- End-to-end tester-session verification for Week 1
- Confirm wallet/profile bootstrap on first successful invite login
- Keep Week 2 market rebuild work paused until Week 1 is fully green

## Deferred by plan discipline
- Market board rebuild
- Market detail rebuild
- Quote/trade ticket UI rebuild
- Portfolio live UI rebuild
- Admin/resolution/settlement UI work

## Current blockers / needs
- Need live invited tester-session verification to formally close Week 1
- If wallet bootstrap is missing for newly authenticated users, inspect Supabase trigger/policy behavior before moving on
