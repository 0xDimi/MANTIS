# 09 — Implementation Backlog

## Milestone 0 — Replace old assumptions

### GBE-000 — Replace single-winner v1 assumptions

Priority: P0

Tasks:

```text
Remove poll leader / award winner / group winner from v1 seed list
Remove initial child price sum 95–105% rule
Remove parent winner resolution from v1 admin flow
Add independent_cluster terminology everywhere
Add feature flag blocking single-winner event creation
```

Acceptance:

```text
No v1 user/admin surface implies exactly one winner
```

## Milestone 1 — Schema and domain model

### GBE-001 — Add independent-cluster event schema

Priority: P0

Tasks:

```text
Add market_events table/columns
Add market_event_outcomes table
Alter markets with event linkage fields
Add event_resolution_batches
Add event_resolution_batch_children
Add event_risk_snapshots
Add event and outcome localization tables
Add public select RLS policies for event read surfaces
Add DB constraints proving child belongs to parent event
```

Acceptance:

```text
Migration runs cleanly on local/staging
Existing standalone markets unaffected
Grouped event tables are readable through public/server read paths
```

### GBE-002 — Add domain types and validators

Priority: P0

Tasks:

```text
Define EventType, OutcomeStructure, ResolutionMode
Validate independent_cluster + child_independent pairing
Reject single_winner_parent when feature disabled
Validate child questions and limits
Validate complete EN/EL localization
Validate admin event writes use profile.id
Validate initialProbability anchors AMM q_yes/q_no
```

Acceptance:

```text
Unit tests prove invalid event structures reject
```

## Milestone 2 — Event read APIs and UI

### GBE-003 — GET /api/events

Priority: P0

Acceptance:

```text
Returns event card payload with child YES prices and education key
```

### GBE-004 — GET /api/events/:slug

Priority: P0

Acceptance:

```text
Returns parent, children, aggregate, user positions if authenticated
```

### GBE-005 — Event card UI

Priority: P1

Acceptance:

```text
Card shows title, top child prices, child count, volume, multiple-YES chip
```

### GBE-006 — Event detail UI

Priority: P1

Acceptance:

```text
Page shows child rows, education copy, selected-child ticket, rules
No sum-to-100 display
```

## Milestone 3 — Admin creation and lifecycle

### GBE-007 — Admin event create flow

Priority: P0

Acceptance:

```text
Admin creates parent + children in one workflow
Child markets inherit shared timing/source/rules
```

### GBE-008 — Parent lifecycle controls

Priority: P0

Acceptance:

```text
Open/pause/close parent updates all children transactionally
```

## Milestone 4 — Trading integration

### GBE-009 — Quote event context

Priority: P1

Acceptance:

```text
Quote response includes parent event context for child markets
```

### GBE-010 — Event exposure cap

Priority: P0

Acceptance:

```text
Trade that exceeds max_user_event_exposure rejects before execution
Parallel child trades cannot bypass max_user_event_exposure
```

### GBE-011 — Portfolio grouping

Priority: P1

Acceptance:

```text
Portfolio groups child positions under parent event
```

## Milestone 5 — Resolution and settlement

### GBE-012 — Batch child resolution proposal

Priority: P0

Acceptance:

```text
Admin can enter YES/NO/VOID per child
Multiple YES values accepted
```

### GBE-013 — Apply resolution batch

Priority: P0

Acceptance:

```text
Child resolutions written idempotently in one transaction
Batch rejects any child that does not belong to the event
```

### GBE-014 — Parent settle status

Priority: P0

Acceptance:

```text
Parent marks settled only after all children settled/voided
```

## Milestone 6 — Risk and analytics

### GBE-015 — Event risk snapshot job

Priority: P1

Acceptance:

```text
Snapshot computes expected_yes_count and worst-case event payout
```

### GBE-016 — Admin risk dashboard

Priority: P1

Acceptance:

```text
Admin sees event risk, child risk, user concentration, no price-sum warning
```

## Milestone 7 — QA and release gates

### GBE-017 — Unit and integration tests

Priority: P0

### GBE-018 — Playwright E2E tests

Priority: P0

### GBE-019 — Seed event pack

Priority: P1

Acceptance:

```text
At least 3 independent grouped events seeded in EN/EL
```

## Recommended PR order

```text
PR 1: schema + types + validators
PR 2: AMM initial probability anchoring + seed helpers
PR 3: admin create + localization + seed script
PR 4: event read APIs
PR 5: event card/detail UI
PR 6: quote event context + atomic event exposure cap
PR 7: portfolio grouping
PR 8: batch child resolution + settlement status
PR 9: risk dashboard + reconciliation
PR 10: E2E + copy polish
```
