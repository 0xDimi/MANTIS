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

## 4) Tester Comms Pack
- Launch message template
- Known-issues template
- Incident update template
- Resolved template

## 5) Rollback Readiness
- Keep last known good deployment URL pinned
- Keep one-command rollback path ready
- Re-run 3-5 min sanity smoke immediately after rollback

## 6) Daily Ops During Week 1
- Morning: health + key flow smoke
- Midday: monitor quote/trade error rates
- EOD: summarize issues, fixes, and next actions

## 7) Morning Next Steps
1. Finalize tester message templates
2. Finalize incident update templates
3. Pin rollback target + owner responsibilities
4. Prepare Day-1 monitoring checklist
