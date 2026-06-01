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
