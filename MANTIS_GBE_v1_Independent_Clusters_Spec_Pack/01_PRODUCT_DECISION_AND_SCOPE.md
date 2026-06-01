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
