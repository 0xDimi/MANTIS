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
