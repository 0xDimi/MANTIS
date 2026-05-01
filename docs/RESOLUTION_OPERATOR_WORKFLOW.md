# MANTIS Resolution Operator Workflow

## Ownership
Alfred owns market closeout.

That means for every real market:
1. pre-close monitoring
2. outcome verification
3. close -> resolve -> settle execution
4. successor-market rollover when a locked slate exists
5. blocker escalation only when evidence is genuinely ambiguous or unavailable

Dimitris should not have to ask whether markets closed properly.

## Operating mode
Phase 1 is agent-operated, not blind autonomous AI settlement.

The system should:
- detect upcoming and overdue markets automatically
- prep evidence before close
- execute lifecycle transitions immediately after close when evidence is clear
- settle and verify public readback
- post only meaningful alerts or completion updates

## Queue detection
Use:
- `scripts/ops-resolution-queue.mjs`

Backlog guard mode for ops sanity:
- `node scripts/ops-resolution-queue.mjs --lookahead-hours 8 --fail-on-backlog true`
- exits non-zero if any real market is overdue-open, unresolved-closed, or resolved-unsettled

Default responsibility:
- upcoming open markets inside lookahead window -> prepare
- overdue open markets -> close immediately and resolve if evidence is ready
- unresolved closed markets -> resolve
- resolved/void unsettled markets -> settle

Ignore test artifacts by default:
- `alpha-smoke-*`
- `admin-smoke-*`
- `settle-*`

## Resolution standard
Only resolve when the source rule is clear enough to survive audit.

If source evidence is clear:
- record concise evidence summary
- resolve
- settle
- verify public detail endpoint shows the right final state

If source evidence is not clear:
- do not guess
- send one concise blocker alert with:
  - market slug
  - why evidence is blocked/ambiguous
  - what source/check is missing

## Successor rollover rule
If a market has a locked successor slate or explicitly approved replacement,
Alfred should open the successor immediately after the old market is safely resolved/settled.

If a successor candidate becomes operationally messy to resolve, replace that slot with a cleaner fallback instead of carrying the fragility forward.

## Cadence
Minimum cadence:
- rolling queue scan every 20 minutes
- special attention to markets closing inside the next 8 hours
- immediate post-close sweep on any overdue real market

## Done definition
A closeout is only done when all of these are true:
- market is no longer stuck open past close
- resolution exists when required
- settlement exists when required
- public `/api/markets/[slug]` readback matches final state
- successor rollout is complete if one was approved

## Failure mode to avoid
The exact failure that already happened:
- monitoring existed
- liquidity automation existed
- but no one actually owned close -> resolve -> settle -> refresh

This workflow exists to make sure that never happens again.

## Board visibility guard
Market operations are not done if users cannot actually see the live slate.
After closeout/rollover work, the live board should still reconcile against `/api/markets`.
Use:
- `node scripts/qa-check-live-board.mjs https://mantis-demo.xyz`
