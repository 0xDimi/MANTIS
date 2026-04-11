# Alpha Run Log

- [2026-04-11 14:31] Week 0 backbone landed (alpha branch + shell + initial schema + core APIs).
- [2026-04-11 14:55] UI-foundation alignment locked: keep current live demo UI, focus only on backend/wiring.
- [2026-04-11 14:56] Next.js upgraded to 15.5.15 (security patch), build remained green.
- [2026-04-11 14:58] Added auth bootstrap + first RLS migration (`0002_auth_rls_bootstrap.sql`).
- [2026-04-11 15:07] Added AMM quote engine + quote preview API.
- [2026-04-11 15:15] Added atomic trade execution migration (`0003_trade_execution_rpc.sql`) and execution API wiring.
- [2026-04-11 15:16] Dev server stabilized on port 3000 after cache/process cleanup.
- [2026-04-11 16:00] Added user-facing read policies migration (`0004_user_read_policies.sql`) for positions/trades/quotes/ledger.
- [2026-04-11 16:01] Added `GET /api/portfolio/summary` and `GET /api/trades/history` endpoints for live portfolio and trade tracking.
- [2026-04-11 16:19] Started route wiring pass: `/markets`, `/markets/[slug]`, and `/portfolio` now load live backend snapshots with graceful fallback when env/auth is missing.
