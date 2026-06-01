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
