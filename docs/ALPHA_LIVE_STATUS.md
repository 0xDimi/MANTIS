# Alpha Live Status

Last updated: 2026-04-11 16:19 (Athens)

## Current phase
- Week 1 to Week 3 backend wiring (under existing demo UI surface)

## Live build/run state
- Branch: `alpha`
- Build: ✅ passing (`npm run build`)
- Dev server: ✅ running (`http://localhost:3000`)
- Health API: ✅ `/api/health`
- Markets/quote/trade APIs: ⚠️ code-ready, waiting for Supabase env wiring

## Completed
- Next.js + TS alpha shell scaffolding
- Supabase schema foundation (`0001_alpha_foundation.sql`)
- Auth bootstrap + first RLS (`0002_auth_rls_bootstrap.sql`)
- AMM v0 quote engine foundation (`lib/amm-v0.ts`)
- Quote preview API (`POST /api/quotes/preview`)
- Trade execution API + atomic RPC path (`POST /api/trades/execute`, `0003_trade_execution_rpc.sql`)
- Portfolio summary API (`GET /api/portfolio/summary`)
- Trade history API (`GET /api/trades/history`)
- Next upgraded to secure version (`15.5.15`)

## In progress
- End-to-end execution validation once Supabase env is connected
- Apply `0004_user_read_policies.sql` in Supabase and validate auth reads for portfolio/trade history
- Connect current demo UI sections fully to live endpoints (markets/detail/portfolio wiring pass started)

## Blockers / needs from Dimi
- Supabase env values in `.env.local` when ready:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
