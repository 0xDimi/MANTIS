# Alpha Live Status

Last updated: 2026-04-11 23:46 (Athens)

## Current phase
- Week 3 backend-live validation (under existing polished demo UI surface)

## Live build/run state
- Branch: `alpha` (synced to origin)
- Build: ✅ passing (`npm run build`)
- Production deploy: ✅ `https://xyz-labs-demo.vercel.app` (aliased after fresh `--prod` deploy)
- Health API: ✅ `/api/health`
- Markets API: ✅ `/api/markets` returns 12 live seeded markets from Supabase
- Root surface: ✅ polished legacy UI shell is active (`/legacy/app.js`, `/legacy/styles.css`)
- Supabase project: ✅ `tvknjsemntrmaxwplgqu` status `ACTIVE_HEALTHY`

## Completed
- Vercel auth resumed and CLI linked to `0xdimis-projects/xyz-labs-demo`
- Supabase project resumed from paused state
- Vercel env wiring completed for `production`, `preview`, `development`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Remote DB migrations applied (`0001` → `0004`)
- Launch market seed applied via migration `0005_seed_launch_markets.sql`
- Production redeploy completed and canonical alias verified

## In progress
- End-to-end auth trade path validation (`/api/quotes/preview` → `/api/trades/execute`) with tester account
- Wire remaining polished UI actions to live portfolio/trade endpoints where needed

## Blockers / needs from Dimi
- None for infra wiring. Next checkpoint is product validation and tester onboarding flow.
