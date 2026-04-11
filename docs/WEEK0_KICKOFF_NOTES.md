# Week 0 Kickoff Notes

## Done at kickoff
- alpha branch created
- provider stack checked: Supabase, Vercel, Sentry, PostHog, Resend
- Resend sending API key created
- initial env map written
- initial route map written
- typed Next.js alpha shell started in existing repo

## Immediate next actions
1. install dependencies and verify local build
2. wire Supabase client + schema foundation
3. create market + wallet seed shape
4. turn placeholder routes into real auth/data flow
5. apply auth bootstrap + first RLS migration (`0002_auth_rls_bootstrap.sql`)

## Timeline stance
- committed target: 5-6 weeks
- no stage skipping
- operational alpha quality over fake speed

## Locked decisions (2026-04-11)
- AMM logic follows `08_AMM_V0_BUILD_READY_SPEC` (simple probability quote engine with controlled slippage)
- sell before resolution: enabled
- default starting paper balance: €1,000
- launch market target: 12-15 (final slate selected close to launch for freshness)
- access mode: email invite + auth
- resend strategy: test sender first, domain setup after core flows are stable

## Backend wiring progress snapshot
- added quote math foundation (`lib/amm-v0.ts`) with controlled slippage + guardrails
- added quote preview API (`POST /api/quotes/preview`)
- added atomic trade execution RPC migration (`0003_trade_execution_rpc.sql`) and wired execution API (`POST /api/trades/execute`)
- expanded market APIs for list/detail state payloads (`/api/markets`, `/api/markets/[slug]`)
