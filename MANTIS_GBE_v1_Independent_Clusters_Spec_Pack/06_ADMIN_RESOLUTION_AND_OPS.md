# 06 — Admin, Resolution, and Ops

## 1. Admin objective

Make grouped events operationally finite:

- one parent creation workflow;
- child markets generated consistently;
- shared timing and source hierarchy;
- child-by-child result entry;
- batch apply and settlement;
- complete audit trail.

## 2. Create event workflow

Admin form sections:

```text
1. Event identity
2. Structure and resolution mode
3. Timing
4. Source and rules
5. Risk and liquidity
6. Child markets
7. Review and publish
```

Required structure values for v1:

```text
event_type = grouped_binary
outcome_structure = independent_cluster
resolution_mode = child_independent
```

The form must block:

```text
single winner
winner selection
Other required because exhaustive
sum-to-100 probability validation
```

Identity lock:

```text
Admin event tables reference profiles.id for created_by, approved_by, published_by, proposed_by, and approved_by.
Existing trading, wallet, positions, and user portfolio rows continue to use auth.users.id.
Admin APIs must map the authenticated user to profile.id before writing event/admin FK fields.
```

## 3. Child market validation

Each child must be independently resolvable.

Good child question:

```text
Will BTC reach a new all-time high by 31 Dec 2026?
```

Bad child question:

```text
Will BTC be the first token to reach ATH?
```

The latter introduces mutual exclusivity / ranking and should be rejected unless explicitly handled in a later version.

## 4. Event review checklist

Before publishing, admin must confirm:

```text
[ ] Event is an independent cluster.
[ ] Multiple children can resolve YES.
[ ] No child depends on another child resolving NO.
[ ] Each child has clear YES/NO criteria.
[ ] Source is objective and accessible.
[ ] Close time and determination time are clear.
[ ] Void rule covers missing/conflicting source.
[ ] Child count is within limit.
[ ] Event loss budget and child b values are visible.
[ ] Greek and English copy are complete.
```

## 5. Lifecycle controls

### Open

`Open parent` opens all child markets that pass validation.

### Pause

`Pause parent` pauses all open children.

### Close

`Close parent` closes all open children to new trades.

### Under review

Parent enters `under_review` when children are closed and results are being entered.

### Resolve

Children are resolved individually or in batch.

### Settle

Settlement runs per child. Parent marks `settled` when all child settlements complete.

## 6. Batch resolution workflow

Admin sees a table:

```text
Outcome | Child question | Current status | Result | Evidence | Notes
BTC     | Will BTC reach ATH? | closed | YES/NO/VOID | URL | text
ETH     | Will ETH reach ATH? | closed | YES/NO/VOID | URL | text
SOL     | Will SOL reach ATH? | closed | YES/NO/VOID | URL | text
```

Valid batch examples:

```text
BTC YES, ETH YES, SOL NO, BNB NO, LINK YES
BTC NO, ETH NO, SOL NO, BNB NO, LINK NO
BTC YES, ETH YES, SOL YES, BNB YES, LINK YES
```

Invalid v1 behavior:

```text
Choose BTC as winner, auto-resolve all others NO.
```

Batch apply must be transactional and integrity-checked:

```text
[ ] Batch row is locked for update.
[ ] Parent event is locked for update.
[ ] Each child_market_id belongs to the same event_id.
[ ] Each child market is closed before resolution.
[ ] Existing identical child resolution makes retry idempotent.
[ ] Existing conflicting child resolution blocks the batch.
[ ] All child resolution ids are written back to event_resolution_batch_children.
[ ] Parent status is recalculated after the batch.
```

No implementation should write child resolutions from the client one-by-one without a server/admin transaction.

## 7. Void behavior

There are two void modes:

### Child void

Only one child is invalid.

Example:

```text
LINK reference source unavailable, but other token sources are valid.
```

### Parent void-all

The entire grouped event invalidates.

Examples:

```text
Source family unavailable for all children.
Rule wording error affects all children.
Event deadline was entered incorrectly.
```

Parent void-all must:

- void every active child;
- write event batch row;
- write child resolution rows;
- trigger settlement/refund policy;
- write audit log.

Void-all must also settle/refund each child through the same child settlement engine used by standalone binary markets. The parent should not be marked settled until the child refund settlements are complete.

## 8. Audit actions

Add or standardize:

```ts
type AdminAuditAction =
  | 'event.create'
  | 'event.update'
  | 'event.review'
  | 'event.approve'
  | 'event.open'
  | 'event.pause'
  | 'event.close'
  | 'event.void_all'
  | 'event.batch_resolution_propose'
  | 'event.batch_resolution_apply'
  | 'event.settle'
  | 'event.archive'
  | 'event.child.add'
  | 'event.child.update'
  | 'event.child.resolve'
  | 'event.risk.override';
```

Audit payload must include:

```text
event_id
child_market_ids affected
before_json
after_json
admin_user_id
reason
created_at
```

## 9. Admin risk panel

Admin event page must show:

```text
Event loss budget
Total child loss budget
Max user event exposure
Largest user event exposure
Expected YES count
Worst-case gross payout
Worst-case net exposure
Child-level liability table
Open quote count
Volume and participant count
```

Do not show price-sum warning for independent clusters.

If the first build does not include the full dashboard, the minimum acceptable admin risk panel is:

```text
event loss budget
child count
child b values
max user event exposure
current largest user event exposure
worst-case gross payout
settlement/reconciliation status
```

## 10. Ops runbook for resolving an event

```text
1. Wait until close time passes or force close with reason.
2. Review official source(s).
3. Enter child result rows.
4. Attach evidence URL and summary.
5. Preview settlement impact.
6. Submit batch proposal.
7. Second admin approves if dual approval enabled.
8. Apply batch.
9. Run settlement.
10. Confirm reconciliation.
11. Mark event settled.
```

## 11. Operator approval boundary

In operator-integrated mode, XYZ Labs prepares the proposed child resolutions and evidence. The operator retains final approval authority before public settlement if required by the integration contract.
