# 13 — Migration From Old GBE Spec

## 1. Why this migration exists

The previous Grouped Binary Events v1 pack made the right architectural move by adding parent events and child binary markets. But its examples and resolution model leaned too far toward single-winner events.

This rebuild keeps the parent/child architecture and replaces the v1 product scope with independent clusters.

## 2. Keep from old spec

Keep:

```text
market_events parent table
market_event_outcomes linkage table
markets.event_id and outcome fields
event card and event detail concepts
event-level portfolio grouping
event-level risk dashboard
event admin creation workflow
child market auto-generation
operator boundary framing
```

## 3. Replace from old spec

Replace:

```text
single winner parent resolution
winning_outcome_id as v1 path
all other children auto-NO
price-sum-to-100 guidance
poll leader / award winner / group winner as v1 seed templates
"winning outcome" glossary
"prices may not sum exactly to 100%" as main explanation
```

With:

```text
child-independent batch resolution
multiple YES allowed
all YES / all NO allowed
no price-sum target
independent threshold/event templates
"multiple can resolve YES" explanation
```

## 4. Schema compatibility

If old columns already exist, do not delete them immediately. Add explicit fields and gate behavior in application logic.

Important implementation detail:

```text
CREATE TABLE IF NOT EXISTS does not repair an old table shape.
If a prior market_events table exists, the migration must inspect columns and add every missing required field with ALTER TABLE ... ADD COLUMN IF NOT EXISTS.
```

Set defaults:

```text
outcome_structure = independent_cluster
resolution_mode = child_independent
is_mutually_exclusive = false
is_exhaustive = false
requires_other_outcome = false
child_resolution_policy = child_independent
```

Add required new tables if missing:

```text
market_event_localizations
market_event_outcome_localizations
event_resolution_batches
event_resolution_batch_children
event_risk_snapshots
```

Add or verify required policies:

```text
public/server read policies for public event surfaces
no direct client write policies for event/admin mutation tables
admin mutations through server routes/service role only
```

Ignore or hide in v1:

```text
price_sum_warning_low
price_sum_warning_high
price_sum_freeze_low
price_sum_freeze_high
```

## 5. UI migration

Remove or hide:

```text
probability distribution visuals
sum-to-100 copy
leader/winner labels
single winner resolution panels
```

Add:

```text
multiple-can-resolve-YES chip
independent row explanation
child-by-child results table
expected YES count in admin only
```

## 6. Admin migration

Old resolution panel:

```text
Select winning outcome
Apply YES to winner and NO to all others
```

New v1 panel:

```text
Enter result for each child:
BTC YES
ETH YES
SOL NO
BNB NO
LINK YES
```

## 7. Seed market migration

Move old templates to future categorical backlog:

```text
Poll leader -> categorical/single-winner backlog
Award winner -> categorical/single-winner backlog
Sports group winner -> categorical or bounded-count backlog
Highest market cap -> categorical/single-winner backlog
```

Seed v1 with:

```text
Tokens ATH
Parties above threshold
Central banks cut rates
Companies above threshold
```

## 8. Acceptance for migration complete

```text
[ ] New docs supersede old single-winner spec
[ ] Code feature flag blocks single-winner grouped events
[ ] Seed markets are independent clusters
[ ] Admin creates child-independent events only
[ ] Public UI says multiple can resolve YES
[ ] No public UI asks users to expect 100% sum
[ ] EN/EL localization tables are populated for every public event
[ ] Initial child probabilities are reflected in q_yes/q_no and first visible prices
[ ] Event exposure cap is enforced atomically during trade execution
[ ] Batch resolution rejects children from other events
```
