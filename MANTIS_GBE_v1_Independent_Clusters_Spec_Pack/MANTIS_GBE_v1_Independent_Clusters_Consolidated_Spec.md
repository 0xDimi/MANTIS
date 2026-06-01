<!-- Source: 00_README.md -->

# MANTIS — Grouped Binary Events v1 Independent Clusters Spec Pack

**Status:** Build-ready replacement spec
**Date:** 2026-05-28
**Pre-build cleanup:** 2026-05-31
**Owner:** XYZ Labs / MANTIS
**Supersedes:** the previous Grouped Binary Events v1 pack that treated v1 primarily as categorical-looking single-winner events.

## Executive decision

MANTIS will ship **Grouped Binary Events v1 as Independent Clusters**.

> One parent event groups multiple existing binary YES/NO child markets. Each child market resolves independently. More than one child can resolve YES. More than one child can resolve NO. All children can resolve YES. All children can resolve NO.

This rebuild intentionally removes the previous v1 assumption that grouped event prices should usually sum near 100%. That assumption only belongs to single-winner categorical or mutually exclusive events. It does **not** belong to independent grouped binary clusters.

## What changed from the previous pack

| Area | Old v1 direction | Rebuilt v1 direction |
|---|---|---|
| Primary event type | Single-winner grouped events | Independent multi-YES / multi-NO clusters |
| Resolution | Parent chooses one winner; all others NO | Admin resolves each child YES / NO / VOID |
| Price-sum rule | Child YES prices should launch near 100% | No price-sum target; prices are independent |
| User copy | “Prices may not sum to 100%” | “Multiple markets can resolve YES” |
| Risk concern | Sum-to-100 coherence and basket arbitrage | Event-level aggregate exposure and worst-case child liability |
| First seed markets | Poll leader, award winner, group winner | Tokens ATH, parties above threshold, central banks cut rates, companies above threshold |
| Future path | True categorical later | True categorical later, but only for single-winner markets |

## Pack contents

| File | Purpose |
|---|---|
| `00_README.md` | This overview and decision summary |
| `01_PRODUCT_DECISION_AND_SCOPE.md` | Product decision, terminology, in/out of scope |
| `02_DOMAIN_MODEL_AND_SCHEMA.md` | Domain model, data rules, SQL model explanation |
| `03_API_SPEC.md` | Public, authenticated, and admin API contracts |
| `04_TRADING_AND_MARKET_MECHANICS.md` | Trading semantics, pricing, positions, settlement semantics |
| `05_UI_UX_SPEC.md` | Event cards, event detail, trade ticket, portfolio grouping, copy |
| `06_ADMIN_RESOLUTION_AND_OPS.md` | Creation, review, open, close, batch resolution, voiding, audit |
| `07_RISK_ANALYTICS_AND_RECONCILIATION.md` | Event-level risk, exposure caps, dashboards, reconciliation |
| `08_QA_AND_ACCEPTANCE_TEST_PLAN.md` | Unit, integration, E2E, release gates |
| `09_IMPLEMENTATION_BACKLOG.md` | Build tickets and PR sequence |
| `10_SEED_MARKETS_AND_LOCALIZATION.md` | Rebuilt seed market catalog and Greek/English copy |
| `11_OPERATOR_BOUNDARY_AND_ROLLOUT.md` | Operator boundary, feature flags, rollout, rollback |
| `12_ADR_GBE_V1_INDEPENDENT_CLUSTERS.md` | Architecture decision record |
| `13_MIGRATION_FROM_OLD_GBE_SPEC.md` | What to delete, keep, rename, and defer from the prior spec |
| `supabase_migration_gbe_v1_independent_clusters.sql` | Draft additive Supabase/Postgres migration |
| `MANTIS_GBE_v1_Independent_Clusters_Consolidated_Spec.md` | Single-file merged version |

## Implementation readiness locks

Before development starts, the implementation must honor these locks:

- Seed child `q_yes/q_no` from `initial_probability`; the current AMM does not price from `virtual_q_*`.
- Enforce event exposure atomically inside trade execution, not only during quote preview.
- Store grouped-event EN/EL copy in event/outcome localization tables; do not extend slug-only hard-coded copy as the source of truth.
- Use `profiles.id` for event/admin FK fields and `auth.users.id` for trading/wallet/position ownership.
- Enable RLS and public/server read policies for event read surfaces; keep event writes server/admin only.
- Validate that every batch child belongs to the same parent event before applying resolutions.
- If an older GBE table exists, repair it with explicit `alter table add column if not exists`; `create table if not exists` is not enough.

## Non-negotiable v1 product truth

Grouped Binary Events v1 are **not** true categorical markets.

The UI can group related questions, but it must be clear that:

- every row is a separate YES/NO market;
- every row has its own tradable YES and NO price;
- multiple rows can resolve YES;
- multiple rows can resolve NO;
- prices are not expected to sum to 100%;
- there is no single winner at the parent event level.

## Recommended first PR sequence

```text
GBE-000 Replace old single-winner assumptions in docs/copy
GBE-001 Add independent-cluster event schema
GBE-002 Add event domain types and validators
GBE-003 Add AMM initial probability anchoring
GBE-004 Add event creation admin flow with EN/EL localization and child binary markets
GBE-005 Add read-only event list/detail API
GBE-006 Add event card and independent-cluster event detail UI
GBE-007 Add selected-child trade ticket integration with atomic event exposure cap
GBE-008 Add batch child-resolution workflow
GBE-009 Add event-level portfolio grouping
GBE-010 Add event risk dashboard and exposure caps
GBE-011 Add E2E tests and reconciliation gates
```

## Release definition

GBE v1 Independent Clusters is releasable when:

- admin can create one parent event with 3–8 child YES/NO markets;
- each child remains a standard MANTIS binary market;
- users can trade any child via the existing quote-confirm ticket;
- child initial probabilities match first visible AMM prices;
- event exposure caps cannot be bypassed by parallel child trades;
- parent and child copy exists in English and Greek before opening;
- event UI clearly states that multiple markets can resolve YES;
- event UI does not show or imply a 100% probability distribution;
- admin can resolve child markets independently in one batch workflow;
- event-level portfolio groups positions under the parent;
- risk dashboard shows aggregate child exposure, not price-sum coherence;
- QA proves multiple YES, multiple NO, all YES, all NO, mixed, and void-all cases.


---

<!-- Source: 01_PRODUCT_DECISION_AND_SCOPE.md -->

# 01 — Product Decision and Scope

## 1. Product decision

MANTIS will ship **Grouped Binary Events v1: Independent Clusters**.

A grouped independent cluster is:

```text
Parent event: “Which tokens will reach a new all-time high by 31 Dec 2026?”
Child A: “Will BTC reach a new all-time high by 31 Dec 2026?” YES/NO
Child B: “Will ETH reach a new all-time high by 31 Dec 2026?” YES/NO
Child C: “Will SOL reach a new all-time high by 31 Dec 2026?” YES/NO
Child D: “Will BNB reach a new all-time high by 31 Dec 2026?” YES/NO
Child E: “Will LINK reach a new all-time high by 31 Dec 2026?” YES/NO
```

Each child is a normal MANTIS binary market. The parent event is an organization, UX, rules, admin, risk, and analytics layer.

## 2. Why this replaces the earlier grouped-binary spec

The earlier GBE spec was structurally useful but too focused on single-winner examples such as poll leaders, award winners, and group winners. Those examples create a categorical coherence problem: if exactly one outcome can win, the outcome prices should approximately form one probability distribution.

Independent clusters avoid that issue entirely. If BTC, ETH, and SOL can all reach ATH, their YES prices do not and should not sum to 100%.

## 3. Terminology

| Term | Definition |
|---|---|
| Parent event | A grouped event container shown on discover and event detail pages |
| Child market | A normal binary YES/NO MANTIS market linked to the parent |
| Independent cluster | Event where each child resolves independently and multiple children can resolve YES |
| Outcome row | A row on the event page representing one child market |
| Child resolution | YES / NO / VOID decision for one child market |
| Batch resolution | Admin workflow to resolve several children at once |
| Event void | Parent-level invalidation that voids all children |
| Expected YES count | Sum of child YES probabilities; useful as optional/admin info, not a probability distribution |
| Event exposure | Aggregate user/platform exposure across all child markets |

## 4. In scope for v1

### Product

- Event cards on discover.
- Event detail pages with 3–8 child outcome rows.
- Child rows show real tradable YES price.
- Row selection opens the existing trade ticket for the child market.
- Event-level education copy: “Multiple markets can resolve YES.”
- Event-level portfolio grouping.
- Event-level rules/source/void summary.
- Parent event admin workflow.
- Batch child-resolution workflow.
- Event-level risk and analytics.

### Trading

- Buy YES on any child.
- Buy NO on any child.
- Sell YES/NO up to held shares, using existing binary sell logic.
- Existing server-side quote-confirm flow.
- Existing binary AMM pricing per child.
- Existing wallet, ledger, trade, quote, and position model.

### Admin

- Create parent event.
- Add 3–8 child markets.
- Configure shared source/rules/timing.
- Optionally override child-specific source/rule text.
- Open/pause/close parent and children together.
- Resolve children independently in a batch.
- Void all children if parent event invalidates.
- Audit every parent and child action.

### Risk

- Event-level max user exposure.
- Event-level max platform loss budget.
- Child-level b/liquidity derived from event budget unless manually overridden.
- Event-level gross liability by child.
- Event worst-case liability across independent child outcomes.
- Concentration alerts.

## 5. Out of scope for v1

Do not build these in v1:

- true N-outcome LMSR;
- single-winner parent resolution;
- exact-one-winner markets;
- price-sum-to-100 display or enforcement;
- hidden normalized probabilities;
- negative-risk conversion;
- basket arbitrage controls for mutually exclusive outcomes;
- CLOB/order book;
- limit orders;
- dynamic outcome expansion after open;
- user-created grouped events;
- real-money wallet changes;
- on-chain settlement;
- comments/social surfaces.

## 6. Explicitly deferred to v2/v3

### v2 candidate

Grouped binaries with stronger coherence controls for:

- mutually exclusive but non-exhaustive events;
- exactly-K events, such as “which two teams qualify”;
- parent-level expected-count monitoring.

### v3 candidate

True categorical markets:

- one parent state vector;
- N outcomes;
- exactly one winning outcome;
- prices sum to 100%;
- N-outcome AMM or equivalent risk-linked mechanism;
- categorical positions and settlement.

## 7. Product principle

The v1 product should say:

> This is a group of related YES/NO markets.

It should not say:

> This is one multi-choice market with one winner.

## 8. Alpha success criteria

GBE v1 succeeds if:

1. Users understand that multiple rows can resolve YES.
2. Users trade more than one child market inside an event.
3. Admin can batch-resolve children without manual DB edits.
4. Portfolio grouping makes multi-position events easy to read.
5. Event risk is visible and bounded.
6. No user-facing surface implies a false 100% distribution.


---

<!-- Source: 02_DOMAIN_MODEL_AND_SCHEMA.md -->

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


---

<!-- Source: 03_API_SPEC.md -->

# 03 — API Spec

## 1. Design principles

Grouped Binary Events v1 should add an event layer without changing core binary trade APIs.

The existing child market quote/execute flow remains the source of truth for trading:

```text
POST /api/quotes/preview
POST /api/trades/execute
GET /api/markets/:slug
GET /api/portfolio
```

New APIs expose parent event data, event creation, batch resolution, and event risk.

## 2. Public event APIs

### `GET /api/events`

Returns event cards for discover shelves.

Query params:

```text
category?: string
status?: open | closed | resolved | settled
search?: string
lang?: en | el
limit?: number
cursor?: string
```

Implementation lock:

```text
Use `lang`, matching the current demo routing and API convention.
Resolve localized event and child copy from localization tables.
Do not use slug-only hard-coded Greek maps for grouped events.
```

Response:

```ts
type EventListResponse = {
  events: Array<{
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    category: string;
    status: string;
    outcomeStructure: 'independent_cluster';
    resolutionMode: 'child_independent';
    closeTime: string;
    determinationTime: string | null;
    childCount: number;
    activeChildCount: number;
    topChildren: Array<{
      marketId: string;
      slug: string;
      outcomeKey: string;
      label: string;
      yesPrice: number;
      noPrice: number;
      status: string;
    }>;
    volumeTotal: number;
    openInterest: number;
    expectedYesCount: number | null;
    explanation: 'multiple_can_resolve_yes';
  }>;
  nextCursor: string | null;
};
```

### `GET /api/events/:slug`

Returns full event detail with children.

Response:

```ts
type EventDetailResponse = {
  event: {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    category: string;
    tags: string[];
    status: string;
    eventType: 'grouped_binary';
    outcomeStructure: 'independent_cluster';
    resolutionMode: 'child_independent';
    closeTime: string;
    determinationTime: string | null;
    sourcePrimary: string;
    sourceFallback: string | null;
    resolutionRule: string;
    voidRule: string;
    userEducationKey: 'multiple_can_resolve_yes';
  };
  children: Array<{
    outcomeId: string;
    marketId: string;
    slug: string;
    outcomeKey: string;
    label: string;
    shortLabel: string | null;
    description: string | null;
    displayOrder: number;
    status: string;
    yesPrice: number;
    noPrice: number;
    volumeTotal: number;
    openInterest: number;
    participantsCount: number;
    lastTradeAt: string | null;
    userPosition?: {
      yesShares: number;
      noShares: number;
      marketValue: number;
      unrealizedPnl: number;
    };
  }>;
  aggregate: {
    childCount: number;
    activeChildCount: number;
    expectedYesCount: number;
    volumeTotal: number;
    openInterest: number;
    userEventExposure?: number;
  };
  serverTime: string;
};
```

## 3. Trading APIs

No new execution endpoint is required for v1.

### Existing quote preview

The client passes the selected child `marketId`.

```ts
type QuotePreviewInput = {
  marketId: string;
  side: 'yes' | 'no';
  action: 'buy' | 'sell';
  amountEur?: number;
  shareAmount?: number;
};
```

Response should include optional event context:

```ts
type QuotePreviewOutput = {
  quoteHash: string;
  expiresAt: string;
  marketId: string;
  eventContext?: {
    eventId: string;
    eventSlug: string;
    outcomeKey: string;
    outcomeLabel: string;
    outcomeStructure: 'independent_cluster';
    currentUserEventExposure: number;
    userEventExposureAfter: number;
    maxUserEventExposure: number;
  };
  quote: {
    side: 'yes' | 'no';
    action: 'buy' | 'sell';
    avgPrice: number;
    sharesDelta: number;
    grossCash: number;
    feeCash: number;
    totalCash: number;
    postYesPrice: number;
    postNoPrice: number;
  };
};
```

### Existing trade execute

```ts
type ExecuteTradeInput = {
  marketId: string;
  quoteHash: string;
  quoteExpiresAt: string;
  side: 'yes' | 'no';
  action: 'buy' | 'sell';
  amountEur?: number;
  shareAmount?: number;
};
```

Response should include updated event summary when the market is an event child.

Implementation lock:

```text
The current demo executes by marketId + quoteHash, not quoteId.
Do not introduce a quoteId-only execute contract unless quote persistence is rebuilt first.
For event children, execution must re-check event exposure atomically inside the DB write path.
```

## 4. Authenticated portfolio APIs

### `GET /api/portfolio/events`

Groups positions by parent event.

```ts
type EventPortfolioResponse = {
  events: Array<{
    eventId: string;
    eventSlug: string;
    title: string;
    outcomeStructure: 'independent_cluster';
    status: string;
    totalCostBasis: number;
    totalMarketValue: number;
    totalUnrealizedPnl: number;
    totalRealizedPnl: number;
    children: Array<{
      marketId: string;
      marketSlug: string;
      outcomeKey: string;
      label: string;
      yesShares: number;
      noShares: number;
      avgYesPrice: number | null;
      avgNoPrice: number | null;
      currentYesPrice: number;
      currentNoPrice: number;
      marketValue: number;
      unrealizedPnl: number;
      maxLossRemaining: number;
    }>;
  }>;
};
```

## 5. Admin APIs

### `POST /api/admin/events`

Creates parent event and optionally child markets.

Input:

```ts
type CreateIndependentEventInput = {
  title: string;
  subtitle?: string;
  description?: string;
  category: string;
  tags: string[];
  outcomeStructure: 'independent_cluster';
  resolutionMode: 'child_independent';
  closeTime: string;
  determinationTime?: string;
  sourcePrimary: string;
  sourceFallback?: string;
  resolutionRule: string;
  voidRule: string;
  eventLossBudget: number;
  feeBps: number;
  maxTradeAmount: number;
  maxUserEventExposure: number;
  children: Array<{
    outcomeKey: string;
    outcomeLabel: string;
    outcomeShortLabel?: string;
    outcomeDescription?: string;
    displayOrder: number;
    childQuestion: string;
    initialProbability: number;
    childLossBudget?: number;
    sourcePrimaryOverride?: string;
    resolutionRuleOverride?: string;
    voidRuleOverride?: string;
  }>;
  localizations: {
    en: EventLocalizationInput;
    el: EventLocalizationInput;
  };
  childLocalizations: Record<
    string,
    {
      en: ChildLocalizationInput;
      el: ChildLocalizationInput;
    }
  >;
};

type EventLocalizationInput = {
  title: string;
  subtitle?: string;
  description?: string;
  sourcePrimary: string;
  sourceFallback?: string;
  sourceNotes?: string;
  resolutionRule: string;
  voidRule: string;
  educationCopy: string;
};

type ChildLocalizationInput = {
  outcomeLabel: string;
  outcomeShortLabel?: string;
  outcomeDescription?: string;
  childQuestion: string;
  sourcePrimaryOverride?: string;
  sourceFallbackOverride?: string;
  resolutionRuleOverride?: string;
  voidRuleOverride?: string;
};
```

Validation:

```text
outcomeStructure must equal independent_cluster
resolutionMode must equal child_independent
children count 3–8 by default
initialProbability per child must be 0.01–0.99
child question must be independently resolvable YES/NO
no parent winner field allowed
no sum-to-100 validation
complete EN/EL parent localization required
complete EN/EL child localization required for every child
admin FK fields use profile.id, not auth user id
seed q_yes/q_no from initialProbability before opening
```

### `PATCH /api/admin/events/:id`

Editable before open:

```text
title, subtitle, description, tags, timing, source, rules, child labels, child questions, initial probabilities
```

Locked after open:

```text
child list, child question, close time, source, resolution rule
```

Post-open edits require super-admin audited correction.

### `POST /api/admin/events/:id/open`

Opens parent and all approved children.

### `POST /api/admin/events/:id/pause`

Pauses parent and all open children.

### `POST /api/admin/events/:id/close`

Closes parent and all open children.

### `POST /api/admin/events/:id/void`

Voids all active children.

Input:

```ts
type VoidEventInput = {
  evidenceSummary: string;
  evidenceUrl?: string;
  sourceUsed: string;
  adminNotes?: string;
};
```

### `POST /api/admin/events/:id/resolution-batches`

Creates a child-by-child resolution batch.

Input:

```ts
type ResolveIndependentEventBatchInput = {
  sourceUsed: string;
  evidenceUrl?: string;
  evidenceSummary: string;
  adminNotes?: string;
  children: Array<{
    childMarketId: string;
    outcomeKey: string;
    resolution: 'yes' | 'no' | 'void';
    childEvidenceSummary?: string;
    childEvidenceUrl?: string;
  }>;
};
```

Rules:

```text
At least one child required.
Not every child must be resolved in the first batch unless event policy requires full batch.
Each child can resolve YES, NO, or VOID.
Multiple YES outcomes are allowed.
All YES outcomes are allowed.
All NO outcomes are allowed.
No winner field exists.
```

### `POST /api/admin/event-resolution-batches/:batchId/apply`

Applies child resolutions in one idempotent transaction.

Apply rules:

```text
Fetch batch with `for update`.
Verify batch status is approved or proposed if single-admin mode is enabled.
Verify every child belongs to the batch event.
Verify every child market is closed and unresolved unless already resolved identically by this batch.
Call/write the existing child resolution path per child inside one transaction.
Store each child resolution id on event_resolution_batch_children.
Update parent status to resolved only when all active children are resolved or void.
Do not auto-resolve any non-mentioned child unless batch_type = void_all.
```

### `POST /api/admin/events/:id/settle`

Settles all resolved child markets that have not yet been settled.

Settle rules:

```text
Run existing child settlement path per resolved/void child.
Skip children already settled idempotently.
Mark event settled only when all active children have status settled or void with refund settlement complete.
Return per-child settlement results and unresolved/failed children.
```

## 6. Error codes

```text
EVENT_NOT_FOUND
EVENT_NOT_OPEN
EVENT_CHILD_NOT_FOUND
EVENT_CHILD_NOT_TRADABLE
EVENT_EXPOSURE_LIMIT_EXCEEDED
EVENT_STRUCTURE_UNSUPPORTED
EVENT_SINGLE_WINNER_BLOCKED_IN_V1
EVENT_CHILD_ALREADY_RESOLVED
EVENT_BATCH_EMPTY
EVENT_BATCH_INVALID_CHILD
EVENT_VOID_REASON_REQUIRED
EVENT_SETTLEMENT_INCOMPLETE
EVENT_LOCALIZATION_INCOMPLETE
EVENT_INITIAL_PROBABILITY_NOT_ANCHORED
EVENT_ADMIN_PROFILE_REQUIRED
EVENT_BATCH_CHILD_EVENT_MISMATCH
```

## 7. Feature flags

```text
GBE_INDEPENDENT_CLUSTER_ENABLED=true
GBE_SINGLE_WINNER_ENABLED=false
GBE_EXACTLY_K_ENABLED=false
GBE_SHOW_EXPECTED_YES_COUNT=false initially for public UI; true for admin
```


---

<!-- Source: 04_TRADING_AND_MARKET_MECHANICS.md -->

# 04 — Trading and Market Mechanics

## 1. Core mechanic

Every child market is a standard binary MANTIS market:

```text
YES share pays €1 if child resolves YES, else €0.
NO share pays €1 if child resolves NO, else €0.
VOID refunds according to existing void policy.
```

The parent event does not change payoff math. It only groups related markets.

## 2. No sum-to-100 rule

Independent clusters do not form one probability distribution.

Example:

```text
BTC reaches ATH: 68¢ YES
ETH reaches ATH: 54¢ YES
SOL reaches ATH: 41¢ YES
BNB reaches ATH: 24¢ YES
LINK reaches ATH: 18¢ YES
```

The YES prices sum to 205¢. That is not wrong. It means the market is pricing roughly 2.05 expected YES outcomes across the group.

Do not:

- normalize these values;
- show a total probability;
- warn that the sum is above 100%;
- block trades because the sum is above 100%;
- call the rows “mutually exclusive outcomes.”

## 3. Existing AMM is preserved

Each child market uses the existing binary LMSR-style state:

```text
q_yes
q_no
b_liquidity
fee_bps
yes_price
no_price
```

For each child:

```text
p_yes = sigmoid((q_yes - q_no) / b)
p_no = 1 - p_yes
```

A YES buy increases that child’s YES price. A NO buy decreases that child’s YES price. No other child price changes.

## 4. Quote semantics

A quote belongs to one child market.

Input:

```text
market_id = selected child market
action = buy | sell
side = yes | no
input value = cash or shares
```

The quote response should include event context only for UX and risk display.

The quote must still be:

- server-authoritative;
- short-lived;
- tied to the exact child market state used for pricing;
- executable only by the quote owner;
- idempotently consumed.

Current demo implementation lock:

```text
Quote identity is hash-based over marketId, side, action, input mode, amount/shares,
expected q_yes/q_no, average price, share delta, post price, and expiry.
There is no durable quoteId-only execution contract yet.
```

## 5. Event exposure check

For child trades inside an event, quote preview and execution must check user event exposure.

Recommended alpha definition:

```text
user_event_exposure = sum(max_loss_remaining across all child positions in event)
```

For a new buy:

```text
user_event_exposure_after = current_user_event_exposure + total_cash_at_risk_for_new_trade
```

Reject if:

```text
user_event_exposure_after > event.max_user_event_exposure
```

Error:

```text
EVENT_EXPOSURE_LIMIT_EXCEEDED
```

The preview check is UX only. The execution check must be atomic in the DB write path.

Required execution behavior:

```text
1. Lock the selected child market row.
2. If the child belongs to an event, lock the parent event row or take an event-scoped advisory transaction lock.
3. Lock the user's positions for all active child markets in the same event.
4. Recompute user_event_exposure from those locked positions.
5. Reject if the new buy would exceed event.max_user_event_exposure.
6. Then execute the normal child-market trade.
```

Do not rely only on route-level exposure checks. Parallel buys across different children must not be able to bypass the event cap.

## 6. Liquidity budget

Use event-level budget to prevent risk multiplication.

Default:

```text
child_loss_budget = event_loss_budget / active_child_count
child_b = child_loss_budget / ln(2)
```

Example:

```text
event_loss_budget = €400
child_count = 5
child_loss_budget = €80
child_b = 80 / ln(2) ≈ 115.4
```

This gives five tradable markets without accidentally creating five full standalone flagship risk budgets.

## 7. Initial probabilities

Each child has its own initial probability.

Rules:

```text
initial_probability > 1%
initial_probability < 99%
admin note required below 5% or above 95%
no sum-to-100 validation
no Other requirement
```

Use virtual/anchor state if supported by the AMM, not fake user trades.

Current demo implementation lock:

```text
The current quote engine reads q_yes/q_no directly.
To seed a non-50/50 child, creation must set q_yes/q_no to match initial_probability.
virtual_q_yes and virtual_q_no are metadata only until the AMM code explicitly prices from them.
```

## 8. Resolution semantics

Independent cluster resolution is child-by-child.

Example:

```text
BTC ATH: YES
ETH ATH: YES
SOL ATH: NO
BNB ATH: NO
LINK ATH: YES
```

All of these are valid:

```text
all children YES
all children NO
some YES, some NO
some VOID, some YES/NO
all VOID if parent invalidates
```

Invalid in v1:

```text
select one winning child
resolve all other children NO automatically because one winner was selected
```

## 9. Settlement semantics

Settlement remains the existing child market settlement.

For each child:

```text
YES child -> YES shares pay €1, NO shares pay €0
NO child -> NO shares pay €1, YES shares pay €0
VOID child -> refund per void policy
```

The parent event is marked `settled` only when all active child markets are settled or voided.

## 10. Portfolio semantics

The user may hold positions in multiple children:

```text
Event: Which tokens will reach ATH?
  BTC YES: 50 shares
  ETH NO: 30 shares
  SOL YES: 20 shares
```

Portfolio event summary:

```text
total cost basis
total current market value
total unrealized P/L
total realized P/L
max loss remaining
```

## 11. Risk semantics

The relevant v1 risk is not price-sum coherence. It is aggregate liability.

For each child market:

```text
liability_if_yes = outstanding_yes_shares
liability_if_no = outstanding_no_shares
child_worst_case_gross_payout = max(liability_if_yes, liability_if_no)
```

For independent event:

```text
event_worst_case_gross_payout = sum(child_worst_case_gross_payout)
```

This is conservative and matches the fact that each child can resolve independently.

## 12. What not to build

Do not add in v1:

- categorical quote engine;
- parent-level price vector;
- probability normalization;
- “buy all outcomes” basket ticket;
- “guaranteed payout” basket logic;
- single-winner admin UI;
- sum-to-100 alerts;
- negative-risk conversion.


---

<!-- Source: 05_UI_UX_SPEC.md -->

# 05 — UI / UX Spec

## 1. UX objective

Make grouped events feel richer than standalone binary markets while keeping the contract understandable.

The user should understand this in under 5 seconds:

```text
This page contains several related YES/NO markets.
More than one can resolve YES.
I can trade each row separately.
```

## 2. Discover event card

Card fields:

```text
Event title
Category
Close time
Top 3–5 child rows with YES price
Child count
Volume / activity
Education chip: “Multiple can resolve YES”
```

Example:

```text
Which tokens will reach a new ATH by year-end?

BTC  68¢ YES
ETH  54¢ YES
SOL  41¢ YES
+2 more

Multiple can resolve YES · Closes 31 Dec
```

Greek:

```text
Ποια tokens θα κάνουν νέο ιστορικό υψηλό έως το τέλος του έτους;

BTC  68¢ ΝΑΙ
ETH  54¢ ΝΑΙ
SOL  41¢ ΝΑΙ
+2 ακόμα

Περισσότερα από ένα μπορούν να κλείσουν στο ΝΑΙ · Λήξη 31 Δεκ
```

## 3. Event detail page layout

Desktop:

```text
[Header]
Title
Subtitle / short explanation
Status, close time, source
Education banner

[Left column]
Outcome row table
Rules panel
Activity / related events

[Right column]
Selected child trade ticket
Selected child mini chart
User position in selected child
```

Mobile:

```text
Header
Education banner
Outcome row list
Tap row -> bottom-sheet trade ticket
Rules accordion
```

## 4. Header copy

English:

```text
Multiple markets can resolve YES.
Each row is a separate YES/NO market with its own price.
```

Greek:

```text
Περισσότερες από μία αγορές μπορούν να κλείσουν στο ΝΑΙ.
Κάθε γραμμή είναι ξεχωριστή αγορά ΝΑΙ/ΟΧΙ με δική της τιμή.
```

## 5. Outcome row

Each row should show:

```text
Outcome label
Outcome description or child question preview
YES price
Optional 24h move
Volume / activity
User position chip if held
Trade button
```

Example:

```text
BTC
Will BTC reach a new ATH by 31 Dec 2026?
68¢ YES  ·  +4¢  ·  €1.2k vol  ·  Trade
```

Do not show:

```text
% of total
normalized probability
rank as if one winner must win
sum of row prices
```

## 6. Trade ticket behavior

The trade ticket is the existing binary ticket, but with event context.

Above the ticket, show:

```text
Selected market: BTC reaches ATH
Part of: Which tokens will reach ATH by year-end?
```

Ticket controls:

```text
Buy / Sell
YES / NO
Amount
Quote summary
Fee
Shares
Max loss
Payout if correct
```

For independent events, keep NO visible in the detailed ticket. Hiding NO only makes sense for single-winner categorical-looking events; v1 is explicitly not that.

## 7. Portfolio grouping

Portfolio should group child positions under the event.

Example:

```text
Which tokens will reach ATH by year-end?
Total market value: €84.20
Unrealized P/L: +€9.40

BTC YES   50 shares   Avg 61¢   Now 68¢   +€3.50
ETH NO    30 shares   Avg 42¢   Now 46¢   -€1.20
SOL YES   20 shares   Avg 35¢   Now 41¢   +€1.20
```

## 8. Rules panel

The event rules panel should have two levels:

### Parent rule

Explains shared timing, source, and void policy.

### Child rule

Each row may have a specific threshold or definition.

Example:

```text
Parent: Prices are checked against CoinGecko ATH data and exchange reference data as of 23:59 UTC on 31 Dec 2026.
Child BTC: Resolves YES if BTC prints a new all-time high in USD before the deadline.
```

## 9. Copy rules

Use:

```text
grouped YES/NO event
related markets
child market
multiple can resolve YES
selected market
```

Avoid:

```text
winner
winning outcome
losing outcomes
probability distribution
sum of probabilities
which one will win
```

## 10. Public education module

English:

```text
How this grouped event works

This page groups several related YES/NO markets. Each row resolves independently. More than one row can resolve YES, and it is also possible that none resolve YES. The price shown on each row is the current tradable YES price for that specific market.
```

Greek:

```text
Πώς λειτουργεί αυτό το ομαδοποιημένο γεγονός

Αυτή η σελίδα ομαδοποιεί πολλές σχετικές αγορές ΝΑΙ/ΟΧΙ. Κάθε γραμμή επιλύεται ανεξάρτητα. Περισσότερες από μία γραμμές μπορούν να κλείσουν στο ΝΑΙ, και είναι επίσης πιθανό καμία να μην κλείσει στο ΝΑΙ. Η τιμή που εμφανίζεται σε κάθε γραμμή είναι η τρέχουσα τιμή ΝΑΙ για τη συγκεκριμένη αγορά.
```

Localization implementation lock:

```text
Grouped-event UI must read parent and child copy from event localization tables.
The existing slug-based Greek fallback is acceptable for standalone markets only.
No grouped event can be opened until EN and EL copy exists for the parent and every child row.
```

## 11. Admin/operator labeling

Admin screens should label event type clearly:

```text
Grouped Binary Event — Independent Cluster
Resolution: Child-by-child
Price sum: Not applicable
```

Greek admin label:

```text
Ομαδοποιημένο δυαδικό γεγονός — ανεξάρτητη ομάδα
Επίλυση: ανά επιμέρους αγορά
Άθροισμα τιμών: δεν εφαρμόζεται
```

## 12. Accessibility and clarity

- Each outcome row must be keyboard selectable.
- Price movement must not rely only on color.
- Education chip must be visible on first visit.
- Event rows must expose child question text to screen readers.
- The trade ticket must announce selected child market changes.


---

<!-- Source: 06_ADMIN_RESOLUTION_AND_OPS.md -->

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


---

<!-- Source: 07_RISK_ANALYTICS_AND_RECONCILIATION.md -->

# 07 — Risk, Analytics, and Reconciliation

## 1. Main risk shift

The v1 risk is **not** price-sum-to-100.

The v1 risk is that one parent event can create several binary markets where the platform may owe payouts on several children at once.

Therefore risk must be tracked at both levels:

```text
child market risk
event aggregate risk
```

## 2. Event-level budget

Each grouped event has:

```text
event_loss_budget
max_child_count
max_trade_amount
max_user_event_exposure
```

Default child budget:

```text
child_loss_budget = event_loss_budget / active_child_count
child_b = child_loss_budget / ln(2)
```

## 3. Gross liability formulas

For each child:

```text
liability_if_yes = outstanding_yes_shares
liability_if_no = outstanding_no_shares
child_worst_case_gross_payout = max(liability_if_yes, liability_if_no)
```

For an independent event:

```text
event_worst_case_gross_payout = sum(child_worst_case_gross_payout)
```

This is conservative because every child can independently land on its worst side.

## 4. Net exposure

Where ledger data is available:

```text
child_net_exposure_if_yes = liability_if_yes - net_cash_collected_on_child
child_net_exposure_if_no = liability_if_no - net_cash_collected_on_child
child_worst_case_net_exposure = max(child_net_exposure_if_yes, child_net_exposure_if_no)
```

Event:

```text
event_worst_case_net_exposure = sum(child_worst_case_net_exposure)
```

## 5. User exposure

For each user:

```text
user_event_exposure = sum(max_loss_remaining across child positions)
```

Reject new trade if:

```text
user_event_exposure_after > max_user_event_exposure
```

This check must run twice:

```text
quote preview: fast UX warning
trade execution: authoritative DB transaction check under event/user position locks
```

Only the execution check is security-relevant. The preview check is not sufficient because users can submit parallel child trades.

Recommended alpha defaults:

```text
max_user_event_exposure = €250 paper
max_trade_amount = €50 paper
max_child_count = 8
```

## 6. Expected YES count

For independent clusters, the useful aggregate price metric is expected YES count:

```text
expected_yes_count = sum(child_yes_price)
```

Example:

```text
BTC 68%, ETH 54%, SOL 41%, BNB 24%, LINK 18%
expected_yes_count = 2.05
```

Interpretation:

```text
The market is pricing about 2.05 YES outcomes out of 5.
```

This is optional for public UI and useful for admin analytics. It is not a coherence constraint.

## 7. Risk dashboard

Admin event risk card:

```text
Event risk status: Normal / Watch / High
Event loss budget
Total child b/liquidity
Worst-case gross payout
Worst-case net exposure
Largest child exposure
Largest user exposure
Expected YES count
Open interest
Volume
Open quote count
```

Child table:

```text
Outcome
YES price
NO price
YES shares
NO shares
Gross payout if YES
Gross payout if NO
Worst-case payout
Volume
Participants
```

## 8. Alerts

Alert on:

```text
user_event_exposure > 80% of cap
largest_child_exposure > 80% of child budget
event_worst_case_net_exposure > event_loss_budget
child market price hits lower/upper bound
sudden volume spike
admin override used
unresolved child past determination window
settlement failed for any child
```

Do not alert on:

```text
YES prices summing above 100%
YES prices summing below 100%
```

unless the event is not an independent cluster.

## 9. Reconciliation checks

Daily or pre-release:

```text
wallet balance = seed + ledger entries
all executed trades have quote_id
all consumed quotes have exactly one trade
positions equal net buys/sells by child market
event portfolio grouping equals sum of child positions
market_state q_yes/q_no matches trades
child settlement payouts match child resolution
parent settled iff all children settled or voided
event exposure snapshots match child positions
event exposure cap cannot be bypassed with parallel child trades
every event child belongs to exactly one parent event
every grouped event has EN/EL localization for parent and children
```

## 10. Release gate reconciliation

GBE v1 cannot ship unless seeded staging passes:

```text
multiple-YES event resolution
all-NO event resolution
all-YES event resolution
mixed YES/NO/VOID event resolution
void-all parent resolution
portfolio grouping after settlement
ledger reconciliation after settlement
```

## 11. Operator analytics

Operator dashboard should show:

```text
event views
child market views
child row CTR
quote requests
trade conversion
traders per event
trades per event
volume per event
positions per event
resolution time
settlement time
support/feedback count
```

This directly supports the operator-pilot proof: user understanding, repeat trading, dispute rate, and operational viability.


---

<!-- Source: 08_QA_AND_ACCEPTANCE_TEST_PLAN.md -->

# 08 — QA and Acceptance Test Plan

## 1. Test philosophy

GBE v1 should reuse the binary market test suite and add tests around grouping, event-level exposure, and batch child resolution.

The biggest bug to prevent is accidentally treating independent clusters like single-winner markets.

## 2. Unit tests

### Domain validation

```text
independent_cluster requires child_independent resolution mode
single_winner_parent blocked in v1
outcome count under/over limit rejects
child initial probability range validates
initial probability seeds q_yes/q_no to matching AMM price
sum-to-100 validation is not called for independent clusters
complete EN/EL localization required before open
admin profile id required for event writes
```

### Risk

```text
child_loss_budget = event_loss_budget / child_count
event_worst_case_gross_payout sums child worst cases
user_event_exposure sums child max loss
trade exceeding user_event_exposure rejects
parallel child buys cannot bypass event exposure cap
expected_yes_count sums child yes prices
```

### Copy / labels

```text
no "winner" copy on independent event page
no "sum to 100" warning on independent event page
education banner key = multiple_can_resolve_yes
```

## 3. Integration tests

```text
admin creates independent event with 5 children
child markets are generated with event_id and outcome_key
GET /api/events returns event card and child rows
GET /api/events/:slug returns children and aggregate
quote on child includes event context
execute child trade updates event exposure
portfolio groups child positions under event
admin batch resolves children YES/NO mix
batch child from another event is rejected
settlement settles all child markets
parent status updates to settled
void-all voids every active child
```

## 4. E2E tests

### `gbe-independent-event-view.spec.ts`

```text
User opens discover
Sees grouped event card
Sees "Multiple can resolve YES"
Opens event page
Sees child outcome rows
No price sum or normalized probability shown
```

### `gbe-child-trade.spec.ts`

```text
User opens event
Selects BTC row
Trade ticket loads BTC child market
User buys YES
Portfolio shows BTC YES under parent event
User buys ETH YES
Portfolio shows both BTC and ETH positions under same parent
```

### `gbe-event-exposure-limit.spec.ts`

```text
User trades across several children
Exposure approaches event cap
Quote that exceeds cap is rejected
Error copy explains event exposure limit
```

### `gbe-batch-resolution-multiple-yes.spec.ts`

```text
Admin closes event
Admin resolves BTC YES, ETH YES, SOL NO, BNB NO, LINK YES
System applies child resolutions
Settlement pays correct positions
Parent marks settled
```

### `gbe-batch-resolution-all-no.spec.ts`

```text
Admin resolves every child NO
Settlement pays NO holders
Parent marks settled
```

### `gbe-void-all.spec.ts`

```text
Admin voids parent event
All children void
Void settlement/refunds apply
Parent marks void/settled
Audit log captures reason
```

## 5. Regression tests from binary alpha

Must still pass:

```text
quote preview deterministic
quote expiry rejects stale execution
duplicate submit does not duplicate trade
buy YES updates q_yes and price
buy NO updates q_no and price
sell cannot exceed held shares
wallet ledger matches trades
binary settlement pays correct side
```

## 6. Manual QA checklist

Product:

```text
[ ] Event card does not look like sportsbook odds wall
[ ] Event detail page explains independent resolution
[ ] Child row selection is obvious
[ ] Trade ticket shows selected child clearly
[ ] Portfolio grouping is understandable
[ ] Greek copy reads naturally
[ ] Grouped events do not depend on hard-coded slug copy
```

Admin:

```text
[ ] Admin can create event and children without DB edits
[ ] Admin can preview child market questions
[ ] Admin can open/pause/close parent
[ ] Admin can batch resolve mixed results
[ ] Admin cannot include a child from another event in a batch
[ ] Admin can void all children
[ ] Audit logs are written
```

Risk:

```text
[ ] Event exposure cap works
[ ] Event exposure cap is enforced under concurrent child trades
[ ] Child liquidity budgets derive correctly
[ ] Child initial probabilities match visible first quote prices
[ ] Risk dashboard shows worst-case event payout
[ ] No price-sum warnings shown for independent clusters
```

## 7. Acceptance criteria

GBE v1 is accepted when:

- at least three seeded independent events are live in staging;
- user can trade two or more children in one event;
- portfolio groups those positions correctly;
- admin resolves multiple children YES in one batch;
- settlement and ledger reconciliation pass;
- all v1 copy avoids single-winner framing;
- all grouped parent/child copy has EN/EL localization rows;
- initial child probabilities match AMM q/state at open;
- event exposure cap is enforced inside the DB write path;
- feature flag prevents single-winner grouped events in alpha.


---

<!-- Source: 09_IMPLEMENTATION_BACKLOG.md -->

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


---

<!-- Source: 10_SEED_MARKETS_AND_LOCALIZATION.md -->

# 10 — Seed Markets and Localization

## 1. Rebuilt market-writing principle

Grouped Binary Events v1 should start with **independent, multi-YES event clusters**.

That means:

- each child market can resolve YES or NO independently;
- more than one child can resolve YES;
- all children can resolve YES;
- all children can resolve NO;
- there is no single winning outcome;
- child YES prices are not expected to sum to 100%.

## 2. Do not use these as v1 public alpha grouped events

These belong to true categorical or later controlled experiments:

```text
Which party will lead the next national poll?
Which team will finish first in Group X?
Which company will have the highest market cap at date X?
Which candidate will win a runoff?
Which film will win Best Picture?
Who will be the next prime minister?
Who will win the election?
```

They are single-winner or mutually exclusive. They create the price-sum/coherence problem that v1 is deliberately avoiding.

## 3. Strong v1 event types

Use event types where independent child markets are natural:

```text
Which tokens will reach a new all-time high by date X?
Which tokens will outperform BTC by date X?
Which parties will poll above X% in the next Source Y poll?
Which central banks will cut rates before date X?
Which companies will close above market cap / price threshold X by date Y?
Which teams will win their next matchday fixture?
Which macro indicators will print above threshold in the next release?
Which films will cross box-office threshold X by date Y?
Which apps will reach top-10 ranking in category X by date Y?
```

Caution: “which teams will qualify from a group” may have exactly K winners. That is not a single-winner market, but it still introduces expected-count coherence. Keep it out of v1 public alpha unless explicitly flagged as a later bounded-count experiment.

## 4. Template 1 — Tokens reach ATH

### Parent event

English:

```text
Which tokens will reach a new all-time high by 31 Dec 2026?
```

Greek:

```text
Ποια tokens θα κάνουν νέο ιστορικό υψηλό έως τις 31 Δεκ 2026;
```

### Child markets

English:

```text
Will BTC reach a new all-time high by 31 Dec 2026?
Will ETH reach a new all-time high by 31 Dec 2026?
Will SOL reach a new all-time high by 31 Dec 2026?
Will BNB reach a new all-time high by 31 Dec 2026?
Will LINK reach a new all-time high by 31 Dec 2026?
```

Greek:

```text
Θα κάνει το BTC νέο ιστορικό υψηλό έως τις 31 Δεκ 2026;
Θα κάνει το ETH νέο ιστορικό υψηλό έως τις 31 Δεκ 2026;
Θα κάνει το SOL νέο ιστορικό υψηλό έως τις 31 Δεκ 2026;
Θα κάνει το BNB νέο ιστορικό υψηλό έως τις 31 Δεκ 2026;
Θα κάνει το LINK νέο ιστορικό υψηλό έως τις 31 Δεκ 2026;
```

### Rule

English:

```text
Each child market resolves independently. A token resolves YES if the primary source records a new all-time high in USD for that token at any time from market open until 23:59 UTC on 31 Dec 2026. A token resolves NO if no new all-time high is recorded by the deadline. If the primary source is unavailable or materially inconsistent, the fallback source is used. If neither source can support a reliable determination, only the affected child market voids unless the source issue affects all children.
```

Greek:

```text
Κάθε επιμέρους αγορά επιλύεται ανεξάρτητα. Ένα token κλείνει στο ΝΑΙ αν η κύρια πηγή καταγράψει νέο ιστορικό υψηλό σε USD για το συγκεκριμένο token οποιαδήποτε στιγμή από το άνοιγμα της αγοράς έως τις 23:59 UTC στις 31 Δεκ 2026. Κλείνει στο ΟΧΙ αν δεν καταγραφεί νέο ιστορικό υψηλό έως την προθεσμία. Αν η κύρια πηγή δεν είναι διαθέσιμη ή παρουσιάζει ουσιώδη ασυνέπεια, χρησιμοποιείται η εφεδρική πηγή. Αν καμία πηγή δεν επιτρέπει αξιόπιστη επιβεβαίωση, ακυρώνεται μόνο η επηρεαζόμενη επιμέρους αγορά, εκτός αν το πρόβλημα αφορά όλες τις επιμέρους αγορές.
```

### Example initial child YES prices

```text
BTC: 68%
ETH: 54%
SOL: 41%
BNB: 24%
LINK: 18%
```

No sum target applies.

## 5. Template 2 — Parties poll above threshold

### Parent event

English:

```text
Which parties will poll above 10% in the next national poll from [Source]?
```

Greek:

```text
Ποια κόμματα θα καταγράψουν πάνω από 10% στην επόμενη πανελλαδική δημοσκόπηση της [Πηγή];
```

### Child markets

English:

```text
Will ND poll above 10% in the next national poll from [Source]?
Will PASOK poll above 10% in the next national poll from [Source]?
Will SYRIZA poll above 10% in the next national poll from [Source]?
Will KKE poll above 10% in the next national poll from [Source]?
Will Greek Solution poll above 10% in the next national poll from [Source]?
```

Greek:

```text
Θα καταγράψει η ΝΔ πάνω από 10% στην επόμενη πανελλαδική δημοσκόπηση της [Πηγή];
Θα καταγράψει το ΠΑΣΟΚ πάνω από 10% στην επόμενη πανελλαδική δημοσκόπηση της [Πηγή];
Θα καταγράψει ο ΣΥΡΙΖΑ πάνω από 10% στην επόμενη πανελλαδική δημοσκόπηση της [Πηγή];
Θα καταγράψει το ΚΚΕ πάνω από 10% στην επόμενη πανελλαδική δημοσκόπηση της [Πηγή];
Θα καταγράψει η Ελληνική Λύση πάνω από 10% στην επόμενη πανελλαδική δημοσκόπηση της [Πηγή];
```

### Rule

English:

```text
Each child market resolves independently based on the first eligible national voting-intention poll from [Source] published after [date/time]. A party resolves YES if its reported voting-intention percentage is strictly above 10.0%. It resolves NO if it is 10.0% or below, or if the party is not separately reported by the source. If no eligible poll is published by [deadline], all children void.
```

Greek:

```text
Κάθε επιμέρους αγορά επιλύεται ανεξάρτητα με βάση την πρώτη επιλέξιμη πανελλαδική δημοσκόπηση πρόθεσης ψήφου της [Πηγή] που θα δημοσιευθεί μετά τις [ημερομηνία/ώρα]. Ένα κόμμα κλείνει στο ΝΑΙ αν το δημοσιευμένο ποσοστό του είναι αυστηρά πάνω από 10,0%. Κλείνει στο ΟΧΙ αν είναι 10,0% ή χαμηλότερο, ή αν το κόμμα δεν αναφέρεται ξεχωριστά από την πηγή. Αν δεν δημοσιευθεί επιλέξιμη δημοσκόπηση έως την [προθεσμία], ακυρώνονται όλες οι επιμέρους αγορές.
```

## 6. Template 3 — Central banks cut rates

### Parent event

English:

```text
Which central banks will cut rates before 30 Sep 2026?
```

Greek:

```text
Ποιες κεντρικές τράπεζες θα μειώσουν τα επιτόκια πριν από τις 30 Σεπ 2026;
```

### Child markets

```text
Will the ECB cut rates before 30 Sep 2026?
Will the Fed cut rates before 30 Sep 2026?
Will the Bank of England cut rates before 30 Sep 2026?
Will the Swiss National Bank cut rates before 30 Sep 2026?
```

Greek:

```text
Θα μειώσει η ΕΚΤ τα επιτόκια πριν από τις 30 Σεπ 2026;
Θα μειώσει η Fed τα επιτόκια πριν από τις 30 Σεπ 2026;
Θα μειώσει η Τράπεζα της Αγγλίας τα επιτόκια πριν από τις 30 Σεπ 2026;
Θα μειώσει η Εθνική Τράπεζα της Ελβετίας τα επιτόκια πριν από τις 30 Σεπ 2026;
```

### Rule

English:

```text
Each child resolves YES if the relevant central bank announces and implements at least one reduction in its main policy rate before 23:59 local time on 30 Sep 2026. It resolves NO if no such reduction occurs by the deadline. Official central bank publications are the primary source.
```

## 7. Template 4 — Companies above threshold

### Parent event

English:

```text
Which companies will close above $1T market cap on [date]?
```

Greek:

```text
Ποιες εταιρείες θα κλείσουν πάνω από $1T κεφαλαιοποίηση στις [ημερομηνία];
```

### Child markets

```text
Will Nvidia close above $1T market cap on [date]?
Will Apple close above $1T market cap on [date]?
Will Microsoft close above $1T market cap on [date]?
Will Amazon close above $1T market cap on [date]?
Will Alphabet close above $1T market cap on [date]?
```

Use only with a clearly defined data source and market-close timestamp.

## 8. Template 5 — Matchday winners across different fixtures

### Parent event

English:

```text
Which teams will win their next league match?
```

Greek:

```text
Ποιες ομάδες θα κερδίσουν τον επόμενο αγώνα πρωταθλήματος;
```

This is acceptable only when each child refers to a different fixture and the outcomes are not mutually exclusive.

Child example:

```text
Will Olympiacos win their next league match?
Will Panathinaikos win their next league match?
Will PAOK win their next league match?
Will AEK win their next league match?
```

Note: avoid grouping teams that are playing each other in the same fixture unless the event is explicitly an independent cluster of match questions and users understand the fixture relationships.

## 9. Initial probability guidance

For independent clusters:

```text
Do not sum initial probabilities to 100%.
Do not require an Other outcome.
Do not show total probability.
Do not launch all children at 50/50 unless justified.
```

Recommended child-level guardrails:

```text
Default child initial probability band: 10%–90%
Admin note required: 5%–10% or 90%–95%
Super-admin override: below 5% or above 95%
```

Optional admin metric:

```text
expected_yes_count = sum(child initial probabilities)
```

## 10. Greek copy glossary

| English | Greek |
|---|---|
| Grouped YES/NO event | Ομαδοποιημένο γεγονός ΝΑΙ/ΟΧΙ |
| Independent cluster | Ανεξάρτητη ομάδα αγορών |
| Child market | Επιμέρους αγορά |
| Multiple can resolve YES | Περισσότερες από μία μπορούν να κλείσουν στο ΝΑΙ |
| Each row resolves independently | Κάθε γραμμή επιλύεται ανεξάρτητα |
| Selected market | Επιλεγμένη αγορά |
| YES price | Τιμή ΝΑΙ |
| NO price | Τιμή ΟΧΙ |
| Expected YES count | Αναμενόμενος αριθμός ΝΑΙ |
| Void all | Ακύρωση όλων |
| Child void | Ακύρωση επιμέρους αγοράς |
| Resolution source | Πηγή επίλυσης |
| Fallback source | Εφεδρική πηγή |
| Close time | Λήξη συναλλαγών |
| Determination time | Χρόνος επιβεβαίωσης |
| Buy YES | Αγορά ΝΑΙ |
| Buy NO | Αγορά ΟΧΙ |
| Sell | Πώληση |
| Shares | Μερίδια |
| Max loss | Μέγιστη απώλεια |
| Payout if correct | Πληρωμή αν επαληθευτεί |

## 10A. Localization storage rule

Grouped-event copy must be stored as data:

```text
market_event_localizations: parent title, description, source, rule, void rule, education copy
market_event_outcome_localizations: child label, question, description, source/rule overrides
```

The existing `lib/market-copy.ts` slug map is only a standalone-market fallback. It must not become the source of truth for grouped events.

Before an event can open:

```text
[ ] parent EN copy exists
[ ] parent EL copy exists
[ ] every child EN copy exists
[ ] every child EL copy exists
[ ] /api/events?lang=en and /api/events?lang=el return localized parent and child copy
[ ] /api/events/:slug?lang=en and /api/events/:slug?lang=el return localized parent and child copy
```

Avoid in v1 public copy:

| Avoid | Reason |
|---|---|
| Winning outcome / Νικήτρια επιλογή | Implies single winner |
| Leading outcome / Πρώτη επιλογή | Implies rank/winner |
| Prices sum to 100% / Οι τιμές αθροίζουν στο 100% | False for independent clusters |
| Which one / Ποιο από αυτά | Can imply one answer |

## 11. Required explanation copy

English:

```text
This grouped event contains several related YES/NO markets. Each row resolves independently. More than one row can resolve YES, and it is possible that none resolve YES. The price shown on each row is the current tradable YES price for that specific market.
```

Greek:

```text
Αυτό το ομαδοποιημένο γεγονός περιλαμβάνει πολλές σχετικές αγορές ΝΑΙ/ΟΧΙ. Κάθε γραμμή επιλύεται ανεξάρτητα. Περισσότερες από μία γραμμές μπορούν να κλείσουν στο ΝΑΙ, και είναι πιθανό καμία να μην κλείσει στο ΝΑΙ. Η τιμή που εμφανίζεται σε κάθε γραμμή είναι η τρέχουσα τιμή ΝΑΙ για τη συγκεκριμένη αγορά.
```

## 12. Seed set recommendation for first alpha push

Use 4 grouped events:

```text
1. Tokens ATH by year-end
2. Parties above threshold in next poll
3. Central banks cut rates before date
4. Companies above threshold by date
```

Each event should have 4–6 child markets.

This gives the demo a multi-outcome feel while avoiding single-winner mechanics.


---

<!-- Source: 11_OPERATOR_BOUNDARY_AND_ROLLOUT.md -->

# 11 — Operator Boundary and Rollout

## 1. Operator-facing framing

Grouped Binary Events v1 should be framed as:

```text
A richer event page that groups related binary forecast markets.
```

Not:

```text
A new multi-outcome exchange.
A categorical betting product.
A peer-to-peer order book.
```

## 2. Boundary fit

The model remains inside the current MANTIS / XYZ Labs boundary:

XYZ Labs owns:

```text
market templates
binary AMM logic
market state
trade-ticket calculations
portfolio UI
admin workflow
resolution evidence tooling
analytics and reporting
```

Operator owns:

```text
customer account
wallet/payments
KYC/AML/sanctions/exclusions
responsible gaming controls
site shell and distribution
final publication approval
final resolution approval where required
complaints/regulatory accountability
```

## 3. Rollout stages

### Stage 0 — internal staging

```text
Feature flag on for admins only
Seed 2 independent events
Test creation, trade, portfolio, mixed resolution, settlement
```

### Stage 1 — private alpha

```text
Feature flag on for testers
Seed 3–4 independent events
Collect user feedback on comprehension
Monitor event-level exposure
```

### Stage 2 — operator demo

```text
Show event cards and event detail UI
Show admin batch resolution
Show risk dashboard
Use paper trading only
Avoid single-winner examples
```

### Stage 3 — pilot candidate

```text
Operator approves limited category set
Operator reviews rules/source templates
Event logs and audit exports enabled
Exposure caps agreed
```

## 4. Feature flags

```text
GBE_INDEPENDENT_CLUSTER_ENABLED=true
GBE_EVENT_DISCOVER_ENABLED=true
GBE_EVENT_PORTFOLIO_GROUPING_ENABLED=true
GBE_EVENT_BATCH_RESOLUTION_ENABLED=true
GBE_ADMIN_RISK_DASHBOARD_ENABLED=true
GBE_SINGLE_WINNER_ENABLED=false
GBE_CATEGORICAL_AMM_ENABLED=false
```

## 5. Rollback plan

Rollback should be simple because child markets are normal binary markets.

If event UI fails:

```text
Disable GBE_EVENT_DISCOVER_ENABLED
Keep child markets accessible as standalone markets if needed
```

If admin event workflow fails:

```text
Disable event creation
Resolve child markets using existing binary admin flow
Keep parent event read-only
```

If batch resolution fails:

```text
Disable batch apply
Resolve children one by one through existing market resolution
Repair parent status after child settlements
```

## 6. Operator demo talking points

```text
This uses the same proven YES/NO mechanics as the rest of MANTIS.
The parent page is a grouping and workflow layer.
Multiple markets can resolve YES, so there is no 100% probability-sum issue.
The operator gets richer market packaging without new execution complexity.
True single-winner categorical markets are a later module once demand is proven.
```

## 7. Do not show in the first operator demo

Avoid:

```text
Who will win the election?
Who will lead the next poll?
Which team will finish first?
```

Those invite the immediate question: “Why don’t probabilities add to 100%?”

Use:

```text
Which parties will poll above 10%?
Which tokens will reach ATH?
Which central banks will cut rates?
```

## 8. Success metrics

```text
event page views
row click-through rate
quote requests per event view
trades per event
number of distinct children traded per user
portfolio grouping comprehension feedback
resolution ops time
admin error rate
support/feedback tagged as confusion
```


---

<!-- Source: 12_ADR_GBE_V1_INDEPENDENT_CLUSTERS.md -->

# 12 — ADR: Grouped Binary Events v1 Independent Clusters

## Status

Accepted.

## Date

2026-05-28

## Context

MANTIS already has a binary YES/NO architecture: centralized AMM, server-side quotes, quote-confirm execution, binary positions, binary settlement, and admin YES/NO/VOID resolution.

The team wants a multi-outcome/event experience closer to leading prediction-market products, but true categorical markets require a deeper architecture change: N-outcome state, N-outcome pricing, categorical positions, categorical settlement, and new risk tooling.

A prior Grouped Binary Events spec treated v1 mostly as a categorical-looking single-winner layer. That creates a price-sum-to-100 problem because independent binary child markets do not automatically form one coherent categorical distribution.

## Decision

Ship v1 as **Independent Grouped Binary Clusters**.

```text
One parent event
Multiple binary child markets
Each child resolves independently
Multiple children can resolve YES
No parent winner
No price-sum-to-100 expectation
Existing binary trading engine preserved
```

## Consequences

### Positive

- Preserves current binary AMM and settlement system.
- Avoids price-sum-to-100 issue for v1.
- Adds richer event UX quickly.
- Creates reusable event/admin/portfolio/risk infrastructure.
- Gives operators a more compelling demo without engine rewrite.
- Keeps true categorical optionality for later.

### Negative

- Does not support “who will win?” markets in v1.
- Some high-value market types remain deferred.
- Users need education that rows resolve independently.
- Event-level exposure can increase if child budgets are not controlled.

## Rejected alternatives

### True categorical AMM now

Rejected for v1 because it is an architecture fork.

### Single-winner grouped binaries now

Rejected for v1 public alpha because it creates price-sum/coherence issues and can confuse users if shown as categorical.

### Negative-risk grouped binaries now

Rejected for v1 because it is more complex than needed and better suited to a future exchange-like or linked-risk architecture.

### CLOB/order book

Rejected because MANTIS is deliberately centralized, quote-confirm, and single-counterparty for the current operator-safe path.

## Future path

```text
v1: independent grouped binary clusters
v1.5: optional bounded-count experiments under admin flag
v2: mutually exclusive grouped binaries with coherence controls if needed
v3: true categorical AMM or linked-risk architecture for exactly-one-winner markets
```

## Decision rule for adding a grouped event

Ask:

```text
Can more than one child resolve YES without contradiction?
Can all children resolve NO without contradiction?
Can each child be resolved from its own YES/NO rule?
```

If yes, it fits GBE v1.

If no, defer to categorical or later grouped-binary versions.


---

<!-- Source: 13_MIGRATION_FROM_OLD_GBE_SPEC.md -->

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


---

<!-- Source: supabase_migration_gbe_v1_independent_clusters.sql -->

-- MANTIS Grouped Binary Events v1 — Independent Clusters
-- Draft Supabase/Postgres migration
-- Date: 2026-05-28
-- Intent: additive migration that supports parent events grouping independent binary child markets.
-- Notes:
--   1. Existing standalone binary markets remain unaffected.
--   2. If the previous GBE migration already ran, this migration adds/adjusts fields for independent clusters.
--   3. Write APIs must pass profile.id for admin/operator FK fields, not auth.users.id.
--   4. Localized public copy is stored in event/outcome localization tables, not hard-coded by slug.
--   5. Child initial probabilities must seed q_yes/q_no directly for the current AMM.

begin;

-- Parent event container.
create table if not exists public.market_events (
  id uuid primary key default gen_random_uuid(),

  slug text not null unique,
  title text not null,
  subtitle text,
  description text,
  category text not null,
  tags text[] not null default '{}',

  event_type text not null default 'grouped_binary'
    check (event_type in ('grouped_binary')),

  outcome_structure text not null default 'independent_cluster'
    check (outcome_structure in (
      'independent_cluster',
      'mutually_exclusive_non_exhaustive',
      'mutually_exclusive_exhaustive',
      'exactly_k_of_n'
    )),

  resolution_mode text not null default 'child_independent'
    check (resolution_mode in (
      'child_independent',
      'single_winner_parent',
      'exactly_k_parent'
    )),

  status text not null default 'draft'
    check (status in (
      'draft',
      'review',
      'approved',
      'open',
      'paused',
      'closed',
      'under_review',
      'resolved',
      'settled',
      'void',
      'archived'
    )),

  close_time timestamptz not null,
  determination_time timestamptz,
  determination_window text,

  source_primary text not null,
  source_fallback text,
  source_notes text,
  resolution_rule text not null,
  void_rule text not null,

  -- Compatibility with older grouped event draft.
  -- For v1 independent clusters these must be false.
  is_mutually_exclusive boolean not null default false,
  is_exhaustive boolean not null default false,
  requires_other_outcome boolean not null default false,

  outcome_edit_policy text not null default 'frozen_after_open'
    check (outcome_edit_policy in (
      'editable_until_open',
      'frozen_after_open',
      'frozen_after_first_trade'
    )),

  price_display_policy text not null default 'show_child_yes_prices'
    check (price_display_policy in (
      'show_child_yes_prices',
      'show_child_yes_prices_with_multiple_yes_explanation'
    )),

  event_loss_budget numeric not null default 400,
  max_child_count int not null default 8,
  max_user_event_exposure numeric not null default 250,
  max_trade_amount numeric not null default 50,

  -- Future use only; must be null for v1 independent clusters.
  target_yes_count numeric,

  created_by uuid references public.profiles(id),
  approved_by uuid references public.profiles(id),
  published_by uuid references public.profiles(id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  published_at timestamptz,
  closed_at timestamptz,
  resolved_at timestamptz,
  settled_at timestamptz,

  constraint market_events_independent_cluster_shape check (
    outcome_structure <> 'independent_cluster'
    or (
      resolution_mode = 'child_independent'
      and is_mutually_exclusive = false
      and is_exhaustive = false
      and requires_other_outcome = false
      and target_yes_count is null
    )
  )
);

-- Localized parent event copy. English may be duplicated here for a uniform read model.
create table if not exists public.market_event_localizations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.market_events(id) on delete cascade,
  locale text not null check (locale in ('en', 'el')),
  title text not null,
  subtitle text,
  description text,
  source_primary text not null,
  source_fallback text,
  source_notes text,
  resolution_rule text not null,
  void_rule text not null,
  education_copy text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id, locale)
);

create index if not exists market_events_status_close_idx
  on public.market_events(status, close_time);

create index if not exists market_events_category_status_idx
  on public.market_events(category, status);

create index if not exists market_events_structure_idx
  on public.market_events(outcome_structure, resolution_mode);

-- Child outcome rows linked to existing binary markets.
create table if not exists public.market_event_outcomes (
  id uuid primary key default gen_random_uuid(),

  event_id uuid not null references public.market_events(id) on delete cascade,
  child_market_id uuid unique references public.markets(id) on delete restrict,

  outcome_key text not null,
  outcome_label text not null,
  outcome_short_label text,
  outcome_description text,

  display_order int not null,
  is_active boolean not null default true,

  initial_probability numeric not null
    check (initial_probability > 0 and initial_probability < 1),

  child_loss_budget numeric,

  source_primary_override text,
  source_fallback_override text,
  resolution_rule_override text,
  void_rule_override text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(event_id, outcome_key),
  unique(event_id, display_order),
  unique(event_id, child_market_id)
);

create index if not exists market_event_outcomes_event_order_idx
  on public.market_event_outcomes(event_id, display_order);

-- Localized child row copy and child-specific rule copy.
create table if not exists public.market_event_outcome_localizations (
  id uuid primary key default gen_random_uuid(),
  outcome_id uuid not null references public.market_event_outcomes(id) on delete cascade,
  locale text not null check (locale in ('en', 'el')),
  outcome_label text not null,
  outcome_short_label text,
  outcome_description text,
  child_question text not null,
  source_primary_override text,
  source_fallback_override text,
  resolution_rule_override text,
  void_rule_override text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(outcome_id, locale)
);

-- Link existing markets to parent events.
alter table public.markets
  add column if not exists event_id uuid references public.market_events(id),
  add column if not exists outcome_key text,
  add column if not exists outcome_label text,
  add column if not exists event_display_order int,
  add column if not exists is_event_child boolean not null default false,
  add column if not exists hide_no_on_event_surface boolean not null default false,
  add column if not exists parent_lifecycle_locked boolean not null default false,
  add column if not exists child_resolution_policy text default 'standalone'
    check (child_resolution_policy in ('standalone', 'child_independent', 'parent_only'));

create index if not exists markets_event_id_idx
  on public.markets(event_id, event_display_order);

create unique index if not exists markets_event_outcome_key_unique_idx
  on public.markets(event_id, outcome_key)
  where event_id is not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'markets_event_child_shape'
      and conrelid = 'public.markets'::regclass
  ) then
    alter table public.markets
      add constraint markets_event_child_shape check (
        (
          is_event_child = false
          and event_id is null
          and outcome_key is null
          and event_display_order is null
          and child_resolution_policy = 'standalone'
        )
        or (
          is_event_child = true
          and event_id is not null
          and outcome_key is not null
          and event_display_order is not null
          and child_resolution_policy = 'child_independent'
        )
      ) not valid;
  end if;
end $$;

-- Optional AMM anchoring support.
-- Current MANTIS quotes price from q_yes/q_no. The seeding path must convert the
-- desired initial_probability into q values before opening the market:
--   q_yes = greatest(ln(p / (1 - p)) * b_liquidity, 0)
--   q_no  = greatest(-ln(p / (1 - p)) * b_liquidity, 0)
-- virtual_q_* columns are metadata only until the quote engine explicitly reads them.
alter table public.market_state
  add column if not exists virtual_q_yes numeric not null default 0,
  add column if not exists virtual_q_no numeric not null default 0,
  add column if not exists user_q_yes numeric not null default 0,
  add column if not exists user_q_no numeric not null default 0,
  add column if not exists initial_probability numeric,
  add column if not exists state_version bigint not null default 1,
  add column if not exists state_hash text;

-- Batch resolution for child-independent events.
create table if not exists public.event_resolution_batches (
  id uuid primary key default gen_random_uuid(),

  event_id uuid not null references public.market_events(id),
  batch_type text not null
    check (batch_type in ('child_results', 'void_all')),

  status text not null default 'proposed'
    check (status in ('proposed', 'approved', 'applied', 'settled', 'rejected', 'reversed')),

  source_used text not null,
  evidence_url text,
  evidence_summary text not null,
  admin_notes text,

  proposed_by uuid not null references public.profiles(id),
  approved_by uuid references public.profiles(id),

  proposed_at timestamptz not null default now(),
  approved_at timestamptz,
  applied_at timestamptz,
  settled_at timestamptz
);

create index if not exists event_resolution_batches_event_idx
  on public.event_resolution_batches(event_id, status);

create table if not exists public.event_resolution_batch_children (
  id uuid primary key default gen_random_uuid(),

  batch_id uuid not null references public.event_resolution_batches(id) on delete cascade,
  event_id uuid not null references public.market_events(id),
  child_market_id uuid not null references public.markets(id),

  outcome_key text not null,
  child_resolution_outcome text not null
    check (child_resolution_outcome in ('yes', 'no', 'void')),

  child_evidence_url text,
  child_evidence_summary text,

  child_resolution_id uuid references public.resolutions(id),
  settlement_status text not null default 'pending'
    check (settlement_status in ('pending', 'resolved', 'settled', 'failed')),

  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(batch_id, child_market_id),
  constraint event_resolution_batch_children_child_belongs_to_event
    foreign key (event_id, child_market_id)
    references public.market_event_outcomes(event_id, child_market_id)
);

create index if not exists event_resolution_batch_children_event_idx
  on public.event_resolution_batch_children(event_id);

create index if not exists event_resolution_batch_children_child_idx
  on public.event_resolution_batch_children(child_market_id);

-- Event risk snapshots. This replaces price-sum monitoring for v1 independent clusters.
create table if not exists public.event_risk_snapshots (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.market_events(id),
  snapshot_at timestamptz not null default now(),

  active_child_count int not null,
  expected_yes_count numeric not null default 0,
  avg_yes_price numeric not null default 0,
  min_yes_price numeric not null default 0,
  max_yes_price numeric not null default 0,

  sum_child_volume numeric not null default 0,
  total_event_open_interest numeric not null default 0,

  worst_case_gross_payout numeric not null default 0,
  worst_case_net_exposure numeric not null default 0,
  largest_child_gross_payout numeric not null default 0,
  largest_user_event_exposure numeric not null default 0,

  metadata_json jsonb not null default '{}'
);

create index if not exists event_risk_snapshots_event_time_idx
  on public.event_risk_snapshots(event_id, snapshot_at desc);

-- RLS follows the existing alpha pattern: public read for public event surfaces,
-- no direct client writes, and service-role/admin routes own all mutations.
alter table public.market_events enable row level security;
alter table public.market_event_localizations enable row level security;
alter table public.market_event_outcomes enable row level security;
alter table public.market_event_outcome_localizations enable row level security;
alter table public.event_resolution_batches enable row level security;
alter table public.event_resolution_batch_children enable row level security;
alter table public.event_risk_snapshots enable row level security;

drop policy if exists "market_events_select_public" on public.market_events;
create policy "market_events_select_public"
on public.market_events
for select
using (status in ('open', 'closed', 'under_review', 'resolved', 'settled', 'void'));

drop policy if exists "market_event_localizations_select_public" on public.market_event_localizations;
create policy "market_event_localizations_select_public"
on public.market_event_localizations
for select
using (
  exists (
    select 1 from public.market_events e
    where e.id = event_id
      and e.status in ('open', 'closed', 'under_review', 'resolved', 'settled', 'void')
  )
);

drop policy if exists "market_event_outcomes_select_public" on public.market_event_outcomes;
create policy "market_event_outcomes_select_public"
on public.market_event_outcomes
for select
using (
  exists (
    select 1 from public.market_events e
    where e.id = event_id
      and e.status in ('open', 'closed', 'under_review', 'resolved', 'settled', 'void')
  )
);

drop policy if exists "market_event_outcome_localizations_select_public" on public.market_event_outcome_localizations;
create policy "market_event_outcome_localizations_select_public"
on public.market_event_outcome_localizations
for select
using (
  exists (
    select 1
    from public.market_event_outcomes o
    join public.market_events e on e.id = o.event_id
    where o.id = outcome_id
      and e.status in ('open', 'closed', 'under_review', 'resolved', 'settled', 'void')
  )
);

drop policy if exists "event_risk_snapshots_select_public" on public.event_risk_snapshots;
create policy "event_risk_snapshots_select_public"
on public.event_risk_snapshots
for select
using (
  exists (
    select 1 from public.market_events e
    where e.id = event_id
      and e.status in ('open', 'closed', 'under_review', 'resolved', 'settled', 'void')
  )
);

-- Optional: event-level audit action names are stored in existing admin_audit_logs.
-- No schema change required if admin_audit_logs.action is text.

-- If an old GBE migration already added price-sum columns, keep them but make them irrelevant for independent clusters.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='market_events' and column_name='price_sum_warning_low'
  ) then
    update public.market_events
      set is_mutually_exclusive = false,
          is_exhaustive = false,
          requires_other_outcome = false,
          outcome_structure = 'independent_cluster',
          resolution_mode = 'child_independent'
      where outcome_structure is null
         or outcome_structure = 'independent_cluster';
  end if;
end $$;

commit;


---
