# Delivery Plan — 6 Weeks (No Corner-Cutting)

## Week 1
- Auth foundation (sign-up/sign-in/session)
- Core schema + first migration
- Seed market candidates (target 12-15 at launch) + wallet model (€1,000 default)
- App shell and route foundation

## Week 2
- Markets list + detail fully DB-backed
- Rules/source panels from DB
- Initial chart and market-state wiring

## Week 3
- AMM v0 server-side quote engine
- Slippage/depth model and exposure checks
- Quote preview and expiry flow

## Week 4
- Trade execution endpoint
- Ledger writes + wallet updates
- Position updates + portfolio summary
- Realtime state updates

## Week 5
- Admin market lifecycle controls
- Resolution workflow (YES/NO/VOID)
- Settlement engine + settled UI states
- Audit logging

## Week 6
- QA pass, smoke tests, validation hardening
- Sentry + PostHog wiring verification
- Invite-only alpha operations prep
- Runbook + closed-alpha launch readiness

## Final product note
- Users must be able to set and update their own nickname (profile display name).
- Keep that requirement sequenced into the real product track without derailing the active week.

## Principle
Compress timeline, not quality.
No stage skipped. No fake core logic.
