# MANTIS Launch Support Runbook v1

## Scope
Move from build validation to launch operations support.

## 1) Launch-Day Command Center
- Owner: Alfred (ops), Dimi (decisions)
- Window: first 4-6 hours after launch
- Watch every 15-30 min:
  - API health uptime
  - Quote preview error rate
  - Trade execute error rate
  - Auth/session failures
  - Portfolio/history write integrity

## 2) Alert Thresholds
- P0: trading execution fails or wallet integrity mismatch
- P1: quotes failing/intermittent, auth degraded
- P2: UI issue with workaround, non-blocking copy/format issue

## 3) Immediate Response Playbook
- P0:
  1. Pause affected markets/admin toggle
  2. Verify last successful trade and latest failing request
  3. Roll back to last known good deployment if needed
  4. Post tester update (short, factual, ETA)
- P1:
  1. Keep markets open if settlement-safe
  2. Patch + hot deploy
  3. Confirm with smoke pass

## 4) Resolution Mechanics (Phase 1 Testing)
- Resolution ownership: **Alfred-managed** (manual admin flow)
- No autonomous AI resolution in phase 1
- No unattended auto-settlement in phase 1
- Resolution flow per market:
  1. Confirm official source/evidence
  2. Record YES/NO/VOID in admin panel with evidence summary + URL
  3. Run settlement
  4. Verify payout/refund totals and status=settled
  5. Post concise tester update

## 5) Tester Comms Pack
- Launch message template
- Known-issues template
- Incident update template
- Resolved template

## 6) Rollback Readiness
- Keep last known good deployment URL pinned
- Keep one-command rollback path ready
- Re-run 3-5 min sanity smoke immediately after rollback

## 7) Daily Ops During Week 1
- Morning: health + key flow smoke
- Midday: monitor quote/trade error rates
- EOD: summarize issues, fixes, and next actions

## 9) Market + News Monitoring Cadence (Locked)
- Ownership: **Alfred** runs checks and drafts actions, **Dimi** supervises and intervenes only on disputed/high-impact decisions.
- Baseline cadence: **every 2 hours** from **09:00 to 23:00 Europe/Athens**.
- High-risk cadence: **every 30-45 minutes** when a market is inside 24h to close, or on major event/news days.
- Overnight cadence: one light sweep at **02:00-03:00 Europe/Athens** unless a high-risk market is active.
- Breaking-news override: trigger an immediate ad-hoc check outside schedule.
- Resolution policy reminder: outcomes remain manual admin decisions (no autonomous AI resolution in phase 1).

## 10) House Liquidity Bot Parameters (Locked)
- Goal: increase tradability while staying market-neutral and transparent.
- Daily market target: **3-4 low-volume markets** (open status only).
- Order size: **€5-€10** per order.
- Daily limits:
  - **Per-market cap:** €40 gross notional
  - **Global cap:** €140 gross notional
- Behavior constraints:
  - symmetric/mirror YES-NO activity only
  - no operation in the final pre-resolution window
  - full audit tagging on each trade
  - immediate kill-switch available at all times

## 11) Automation Runtime (Live)
- Ops endpoints are live:
  - `/api/ops/market-checks/run` (internal schedule gating enforces baseline/high-risk/overnight cadence)
  - `/api/ops/house-liquidity/run`
- Scheduler source:
  - host-side automation (Alfred/cron) triggers these endpoints on cadence
  - note: Vercel Hobby cron cannot run sub-daily schedules
- Trigger auth:
  - preferred: `Authorization: Bearer $CRON_SECRET`
  - fallback: `OPS_RUN_KEY` via bearer / `x-ops-key` / `?key=`
  - if neither secret exists in production, endpoint accepts calls (temporary compatibility mode)
- House-liquidity runtime defaults:
  - user id: `HOUSE_LIQUIDITY_USER_ID` (fallback synthetic internal id)
  - enable/disable: `HOUSE_LIQUIDITY_BOT_ENABLED=true|false` (kill switch)
  - order amount: `HOUSE_LIQUIDITY_ORDER_EUR` (clamped 5-10)
  - daily caps: `HOUSE_LIQUIDITY_PER_MARKET_DAILY_CAP_EUR`, `HOUSE_LIQUIDITY_GLOBAL_DAILY_CAP_EUR`
  - target markets/day: `HOUSE_LIQUIDITY_TARGET_MARKETS` (max 4)
- Runtime writes latest snapshots to `mission_control_runtime`:
  - `ops_market_checks_latest`
  - `house_liquidity_latest`

## 12) Morning Next Steps
1. Set `CRON_SECRET` and `HOUSE_LIQUIDITY_USER_ID` in production envs
2. Ensure host-side scheduler is active and logging each trigger
3. Finalize tester message templates
4. Finalize incident update templates
5. Pin rollback target + owner responsibilities
6. Prepare Day-1 monitoring checklist
