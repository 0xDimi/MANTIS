# xyz Labs Alpha (MANTIS branch)

Operational alpha foundation for the prediction-market build.
UI parity with the existing live demo is mandatory while backend/alpha logic is wired underneath.

## Current status

Kickoff is live.

Completed in Week 0 foundation:
- `alpha` branch created
- Next.js + TypeScript app shell scaffolded
- route map scaffolded (`/`, `/markets`, `/markets/[slug]`, `/portfolio`, `/profile`, `/rules`, `/admin/*`)
- env map added (`.env.example`, `docs/ALPHA_ENV_MAP.md`)
- Supabase schema migration foundation added (`supabase/migrations/0001_alpha_foundation.sql`)
- auth bootstrap + first RLS migration added (`supabase/migrations/0002_auth_rls_bootstrap.sql`)
- atomic trade execution RPC migration added (`supabase/migrations/0003_trade_execution_rpc.sql`)
- initial market seed candidate pack added (`supabase/seed/001_launch_markets.sql`, currently 12 candidates; final 12-15 selected near launch)
- API scaffolds added (`/api/health`, `/api/markets`, `/api/me`)
- market detail + quote/trade foundation APIs added (`/api/markets/[slug]`, `/api/quotes/preview`, `/api/trades/execute`)

## Local run

```bash
cd side-project-os/prediction-market/demo
npm install
npm run dev
```

Open:
- <http://localhost:3000>

## API quick checks

```bash
curl http://127.0.0.1:3000/api/health
curl http://127.0.0.1:3000/api/markets
curl http://127.0.0.1:3000/api/markets/<slug>
curl -X POST http://127.0.0.1:3000/api/quotes/preview -H 'content-type: application/json' -d '{"marketSlug":"gre-politics-election-seat-majority","side":"yes","action":"buy","amountEur":50}'
# auth-required examples
curl http://127.0.0.1:3000/api/portfolio/summary
curl http://127.0.0.1:3000/api/trades/history?limit=50
```

If Supabase env vars are not wired yet, `/api/markets` intentionally returns an env wiring error.

## Key docs

- `docs/WEEK0_KICKOFF_NOTES.md`
- `docs/ALPHA_ENV_MAP.md`
- `docs/ALPHA_ROUTE_MAP.md`
- `docs/DELIVERY_PLAN_6_WEEKS.md`
- `docs/ALPHA_API_WORKFLOW.md`
- `docs/ALPHA_LIVE_STATUS.md`
- `docs/ALPHA_RUN_LOG.md`

## Notes

- Existing demo UI is the surface reference. Backend and wiring are now being built under that same product look/flow.
- Legacy static-demo files remain in repo for parity checks during migration.
