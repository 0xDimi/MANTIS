# 02 — Domain Model and Schema

## 1. Domain model

```text
market_events
  ├── market_event_localizations
  └── market_event_outcomes
        ├── market_event_outcome_localizations
        └── markets
              ├── market_state
              ├── quotes
              ├── trades
              ├── positions
              └── resolutions
```

The parent event stores shared UX, timing, source, risk, and admin metadata. The child markets remain the existing MANTIS binary markets.

## 2. Event structure

GBE v1 uses only:

```ts
type OutcomeStructure = 'independent_cluster';
type ResolutionMode = 'child_independent';
```

Future values can exist in code, but must be feature-flagged and blocked from public alpha:

```ts
type FutureOutcomeStructure =
  | 'mutually_exclusive_non_exhaustive'
  | 'mutually_exclusive_exhaustive'
  | 'exactly_k_of_n';

type FutureResolutionMode =
  | 'single_winner_parent'
  | 'exactly_k_parent';
```

## 3. Core tables

### `market_events`

Parent event container.

Key fields:

```text
id
slug
title
subtitle
description
category
tags
event_type = grouped_binary
outcome_structure = independent_cluster
resolution_mode = child_independent
status
close_time
determination_time
source_primary
source_fallback
resolution_rule
void_rule
event_loss_budget
max_child_count
max_user_event_exposure
max_trade_amount
created_by
approved_by
published_by
created_at
updated_at
```

### `market_event_outcomes`

Links each outcome row to one existing binary child market.

Key fields:

```text
id
event_id
child_market_id
outcome_key
outcome_label
outcome_short_label
outcome_description
display_order
initial_probability
child_loss_budget
source_primary_override
resolution_rule_override
void_rule_override
is_active
created_at
updated_at
```

### `market_event_localizations`

Stores public parent event copy by locale. Do not rely on hard-coded slug maps for grouped events.

Key fields:

```text
id
event_id
locale = en | el
title
subtitle
description
source_primary
source_fallback
source_notes
resolution_rule
void_rule
education_copy
created_at
updated_at
```

### `market_event_outcome_localizations`

Stores public child row copy by locale.

Key fields:

```text
id
outcome_id
locale = en | el
outcome_label
outcome_short_label
outcome_description
child_question
source_primary_override
source_fallback_override
resolution_rule_override
void_rule_override
created_at
updated_at
```

Required rule:

```text
Every publishable event must have complete en and el localization rows for the parent and every child.
```

### `markets` additions

Existing markets need only additive fields:

```text
event_id
outcome_key
outcome_label
event_display_order
is_event_child
hide_no_on_event_surface
parent_lifecycle_locked
child_resolution_policy = child_independent | standalone
```

For standalone markets:

```text
is_event_child = false
event_id = null
outcome_key = null
event_display_order = null
child_resolution_policy = standalone
```

For grouped-event children:

```text
is_event_child = true
event_id is not null
outcome_key is not null
event_display_order is not null
child_resolution_policy = child_independent
```

### `event_resolution_batches`

Parent-level admin batch operation. It does **not** choose one winner. It records a batch of child YES/NO/VOID decisions.

```text
id
event_id
batch_type = child_results | void_all
status = proposed | approved | applied | settled | rejected | reversed
source_used
evidence_url
evidence_summary
admin_notes
proposed_by
approved_by
proposed_at
approved_at
applied_at
settled_at
```

### `event_resolution_batch_children`

One row per child decision in a batch.

```text
id
batch_id
event_id
child_market_id
outcome_key
child_resolution_outcome = yes | no | void
child_resolution_id
settlement_status
error_message
created_at
updated_at
```

### `event_risk_snapshots`

Event-level risk and analytics.

```text
id
event_id
snapshot_at
active_child_count
expected_yes_count
avg_yes_price
min_yes_price
max_yes_price
sum_child_volume
total_event_open_interest
worst_case_gross_payout
worst_case_net_exposure
largest_child_gross_payout
largest_user_event_exposure
metadata_json
```

## 4. Data invariants

For `outcome_structure = independent_cluster`:

- `resolution_mode` must equal `child_independent`.
- `is_mutually_exclusive` must be false.
- `is_exhaustive` must be false.
- parent event must not have `winning_outcome_id`.
- child markets may resolve in any mix of YES/NO/VOID.
- child YES prices are not expected to sum to 100%.
- parent event status is derived from child statuses after close/resolution.
- each `event_resolution_batch_children.child_market_id` must belong to the same `event_id`.
- batch apply must be idempotent and must not create duplicate `resolutions` or `market_settlements`.
- event admin FK fields use `profiles.id`, while trade/position/wallet ownership continues to use `auth.users.id`.
- public grouped-event copy comes from localization rows, with both `en` and `el` required before opening.

## 5. Lifecycle state rules

Parent status should control child availability:

| Parent status | Child behavior |
|---|---|
| `draft` | Children may be drafted but not open |
| `review` | Children locked for review |
| `approved` | Children ready to publish |
| `open` | Children open unless individually paused by super-admin |
| `paused` | All children paused |
| `closed` | All children closed to new trades |
| `under_review` | Admin can enter child results |
| `resolved` | All active children resolved or voided |
| `settled` | All resolved children settled |
| `void` | All active children voided |
| `archived` | Read-only |

## 6. Child market generation

When admin creates an event, the system should generate child markets from outcome rows.

Example parent:

```text
Which tokens will reach a new all-time high by 31 Dec 2026?
```

Child template:

```text
Will [Outcome] reach a new all-time high by 31 Dec 2026?
```

All child markets inherit:

```text
category
tags
close_time
determination_time
source_primary
source_fallback
void_rule
fee_bps
max_trade_amount
```

Each child can override:

```text
question
resolution_rule
source_primary
source_fallback
void_rule
initial_probability
child_loss_budget
```

## 7. Liquidity budget rule

Event-level risk should not multiply accidentally.

Default:

```text
child_loss_budget = event_loss_budget / active_child_count
child_b = child_loss_budget / ln(2)
```

Admin can override child loss budgets only if:

- total child loss budget is still visible at parent level;
- override reason is required;
- audit log records before/after values.

## 8. Initial probability anchoring

For independent clusters, child probabilities are independent. They do not need to sum to 100%.

Good launch state:

```text
BTC ATH: 68%
ETH ATH: 54%
SOL ATH: 41%
BNB ATH: 24%
LINK ATH: 18%
```

This sum is 205%, and that is acceptable because multiple tokens can reach ATH.

Child markets should not all start at 50/50 unless the event genuinely has no prior signal.

Current demo implementation lock:

```text
The live MANTIS AMM prices from q_yes, q_no, and b_liquidity.
It does not price from market_state.initial_probability or virtual_q_*.
```

Therefore event creation must convert desired child initial probability into actual AMM state before opening:

```text
logit_p = ln(initial_probability / (1 - initial_probability))
q_yes = max(logit_p * b_liquidity, 0)
q_no = max(-logit_p * b_liquidity, 0)
yes_price = initial_probability
no_price = 1 - initial_probability
```

Examples:

```text
If p = 68% and b = 115.4:
logit_p ~= 0.754
q_yes ~= 87.0
q_no = 0

If p = 24% and b = 115.4:
logit_p ~= -1.153
q_yes = 0
q_no ~= 133.1
```

Do not seed initial probability by fake user trades.
Do not rely on `virtual_q_yes` / `virtual_q_no` until the quote engine explicitly includes them in pricing.

## 9. Migration compatibility

The previous GBE migration introduced useful parent event and outcome linkage concepts. Keep the general event/outcome tables, but change defaults and constraints from single-winner to independent cluster.

Before applying the migration, inspect whether any old `market_events` table already exists. If it does, the migration must explicitly `alter table add column if not exists` for every required field because `create table if not exists` will not add missing columns.

Deprecate or ignore for v1:

```text
price_sum_warning_low
price_sum_warning_high
price_sum_freeze_low
price_sum_freeze_high
requires_other_outcome
parent-only winner resolution semantics
```

Do not delete old columns immediately if already migrated in staging. Instead:

- add new explicit fields;
- set old single-winner fields to false/unused;
- hide old admin UI;
- add validation that blocks single-winner event creation in v1.
