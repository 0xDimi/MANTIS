# Alpha Live Status

Last updated: 2026-04-12 00:38 (Athens)

## Current phase
- Week 4 integration kickoff (backend trade path validated on production, UI flow wiring in progress)

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
- Remote DB migrations applied (`0001` → `0008`)
- Launch market seed applied via migration `0005_seed_launch_markets.sql`
- Production redeploy completed and canonical alias verified
- End-to-end authenticated trade path validated on production (`/api/quotes/preview` → `/api/trades/execute` → `/api/portfolio/summary` + `/api/trades/history`) using tester account

## In progress
- Wire remaining polished UI actions to live portfolio/trade endpoints where needed
- Stage 4 UI integration pass for detail ticket, execution confirmation, and portfolio refresh loops
- Mission Control live operations room now active at `https://xyz-labs-mission-control.vercel.app` with 10s refresh cycle

## Blockers / needs from Dimi
- None for infra wiring. Next checkpoint is product validation and tester onboarding flow.
- If needed later: tune the runtime worker filter to include/exclude extra process classes in mission control.
