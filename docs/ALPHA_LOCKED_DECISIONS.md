# Alpha Locked Decisions (2026-04-11)

## Product and trading
- AMM v0 behavior follows `08_AMM_V0_BUILD_READY_SPEC`
- Sell-before-resolution is enabled in alpha
- Controlled automation for market-making/trading flow is allowed, but must be rules-based (no random blanket bot activity across all markets)
- Trading operations can be managed by Alfred without per-trade Dimitris approval, within explicit risk limits and runbook guardrails

## Tester economics
- Starting paper balance per tester: **€1,000**

## Launch market slate
- Target launch set: **12-15 markets**
- Final market selection happens close to alpha launch for freshness
- Launch-first slate must stay simple and mainstream (clear YES/NO, easy-to-understand resolution)
- No crypto markets in the initial alpha launch set
- Freeze market-content iteration now; revisit and finalize the launch slate only at pre-launch readiness gate

## Access and onboarding
- Access mode: email invite + auth
- Tester activation must include a clear "first trade" walkthrough flow
- Walkthrough testing is scheduled post-UI-polish and pre-launch

## Market operations cadence
- Market + news monitoring owner: **Alfred** (execution), **Dimi** (supervisory interventions only when needed)
- Baseline market/news checks: every 2 hours (09:00-23:00 Europe/Athens)
- High-risk checks (market <24h to close or major event day): every 30-45 minutes
- Overnight: one light check around 02:00-03:00 Europe/Athens
- Breaking-news override: immediate ad-hoc check outside schedule

## House liquidity bot guardrails (phase 1)
- Purpose: improve tradability only, not directional prediction or sentiment shaping.
- Market selection: **3-4 low-volume open markets per day**.
- Order sizing: **€5-€10 per order**.
- Execution mode: symmetric/mirror behavior across YES/NO with cool-down windows.
- Budget caps:
  - **Per market daily cap:** €40 gross notional
  - **Global daily cap:** €140 gross notional
- Safety rails: disable near resolution windows, keep full audit tags, and retain manual kill-switch.

## Resend
- Keep test sender identity first
- Move to domain setup after core trading/admin flows are stable

## Deployment and naming
- Keep `https://xyz-labs-demo.vercel.app` as the single canonical demo surface
- Treat `*-git-alpha-*` URLs as internal preview links only (not user-facing)
- Continue alpha plan by wiring backend operations into the polished existing UI
- Final public naming target when ready: **Alpha Demo v1**

## UI polish target (pre-launch)
- UI polish must ship as the real public-facing product surface (not a test/demo-looking UI).
- Remove visible demo/testing/rebuild/operational hints from user-facing copy.
- Prioritize mobile-first layout quality and interaction clarity across core routes.
