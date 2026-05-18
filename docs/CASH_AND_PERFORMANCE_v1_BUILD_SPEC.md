# Cash and Performance v1 Build Spec

**Project:** MANTIS paper-trading alpha  
**Date:** 2026-05-19  
**Status:** approved-for-build draft  
**Roadmap slot:** Update 1

## 1. Objective

Upgrade Portfolio from a clean snapshot into a clean performance surface.

The user should be able to answer four questions without leaving `/portfolio`:
- What is my account worth right now?
- Where did my cash go over time?
- Which markets made or lost me money?
- How am I performing overall?

## 2. Product constraints

This release must preserve the current premium feel.

Hard guardrails:
- No overfilled dashboard behavior.
- No giant analytics wall.
- No more than one new major information block per tab.
- Summary first, drill-down second.
- Existing visual hierarchy should stay calm and readable on mobile.
- Any new chart must be subtle, lightweight, and explanatory, not decorative.
- No change to core AMM, trade execution, or settlement contracts.

## 3. Scope

## In scope

### A. Performance snapshot inside Portfolio
Add a compact, premium performance strip inside the **History** view with:
- markets traded
- settled markets
- win rate
- average settled return

### B. Realized attribution inside History
Add a second level inside **History** that ranks settled market outcomes by realized PnL:
- best market
- worst market
- ranked realized attribution list

### C. Cash activity view
Add one new portfolio tab: **Activity**.

This tab includes:
- cash balance path chart built from wallet ledger entries
- current account split
  - available cash
  - open exposure
- cash activity ledger
  - starting balance / seed
  - buys
  - sells
  - settlement payouts
  - void refunds
  - manual adjustments if any

### D. Supporting API surface
Add one new read route:
- `GET /api/portfolio/performance`

This route should return:
- performance snapshot
- realized attribution list
- best/worst market
- current account split
- balance series
- activity ledger rows

## Explicitly out of scope for v1
- full historical marked-to-market equity reconstruction
- advanced portfolio analytics
- benchmark comparison
- Sharpe-style stats
- leaderboards
- export / CSV
- additional notification logic

## 4. UX design

## Portfolio tabs after release
- Open exposure
- History
- Executions
- Activity

This is the maximum tab count for now. Do not add more.

## History tab design

Keep the existing settled-history table.

Add above it:
1. **Performance snapshot strip**
   - four compact stat chips/cards
   - visually lighter than the top wallet metrics
2. **Attribution summary block**
   - best market
   - worst market
   - subtle ranked list below

Design rules:
- keep copy tight
- use one calm section title
- avoid nested card noise
- if attribution is empty, show a minimal empty state

## Activity tab design

Top to bottom:
1. **Balance path chart**
   - simple line/area chart
   - no heavy axes or trading-terminal visual overload
   - default range is all available activity points
2. **Current account split**
   - cash vs open exposure
   - simple split bar + two values
3. **Activity ledger**
   - reverse chronological
   - clean labels, amount, balance after, timestamp
   - market name when relevant
   - subtle detail text for side/outcome when available

Design rules:
- chart should feel premium and restrained
- ledger should read like an account statement, not a developer log
- use progressive density: summary first, raw events second

## 5. Data definitions

## Performance snapshot
- `marketsTraded`: distinct markets with at least one trade
- `settledMarkets`: settled/void/resolved markets with final realized result available
- `winRate`: wins / (wins + losses), excluding void and flat
- `avgSettledReturnPct`: average of market-level realized return where return = realized PnL / buy-side committed cash

## Market-level realized attribution
Per settled market:
- market id / slug / question / category / status
- realized PnL
- committed cash
- return pct
- settled timestamp
- result (`won`, `lost`, `void`, `flat`)

## Current account split
- `availableCash`: wallet available balance
- `openExposure`: current open position market value
- `totalAccountValue`: available cash + open exposure
- `cashSharePct`
- `openExposureSharePct`

## Activity ledger rows
Fields:
- id
- entry type
- amount
- balance after
- created at
- market meta if present
- detail label
- detail sublabel

Entry-type presentation mapping:
- `seed` -> Starting balance
- `trade_buy` -> Buy
- `trade_sell` -> Sell
- `settlement` -> Settlement payout
- `void_refund` -> Void refund
- `manual_adjustment` -> Adjustment

## Balance series
Use wallet ledger chronology.
Each point:
- time
- balanceAfter
- entryType

If no seed row exists, synthesize a starting point from wallet starting balance.

## 6. API contract

## `GET /api/portfolio/performance`

Returns:
- `summary`
- `attribution`
- `bestMarket`
- `worstMarket`
- `accountSplit`
- `activity`
  - `series`
  - `entries`

Error behavior:
- `401` when auth missing
- `500` with safe message on query failure
- capture backend errors with Sentry tags matching route name

## 7. Implementation notes

- Reuse existing portfolio summary math where possible.
- Query `ledger_entries` for cash movement and balance path.
- Join `trades`, `markets`, `resolutions`, and `market_settlement_entries` where needed to enrich labels.
- Use market-level aggregation, not trade-level aggregation, for attribution.
- Keep all numeric outputs rounded consistently for UI.
- Do not bloat `/api/portfolio/summary`; add a separate route for Update 1 concerns.

## 8. QA and acceptance

## Build acceptance
- `npm run typecheck` passes
- `npm run build` passes
- portfolio page renders with no runtime errors
- new route returns valid payload for authenticated user
- empty-state user still sees a clean page

## Product acceptance
A tester can:
- understand wallet cash movement from the Activity tab
- identify best and worst settled markets from History
- see win rate and average settled return without hunting
- understand current cash vs open exposure split at a glance

## Visual acceptance
- no overcrowded layout
- mobile still feels intentional
- new sections do not overpower the page
- page still reads like a premium product, not an admin dashboard

## 9. Deferred to later phases

These are intentionally deferred:
- full historical mark-to-market account value curve
- scenario analysis
- advanced attribution by category/timeframe
- downloadable statements
- benchmarking and leaderboards
