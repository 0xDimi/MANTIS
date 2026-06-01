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
