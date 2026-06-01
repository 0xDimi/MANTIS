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
