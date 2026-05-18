# Alpha Next Updates Roadmap v1

**Project:** MANTIS paper-trading alpha  
**Date:** 2026-05-19  
**Status:** official post-portfolio roadmap  
**Context:** portfolio/history upgrade is now live; next work should move the demo from "works" to "feels like a real market product"

## 1. Roadmap objective

The next update cycle should improve three things in order:

1. **Performance clarity**
   - Users should understand where their money moved and why.
2. **Trust clarity**
   - Users should understand why a market exists, how it resolves, and what evidence supports it.
3. **Launch readiness**
   - Testers should be able to sign in, make a first trade, and trust the product without hand-holding.

## 2. Sequencing rules

- Ship **one major update at a time**.
- Avoid feature sprawl.
- Prefer **user understanding** over novelty.
- Do not change core AMM or settlement architecture unless a clear product or risk problem requires it.
- Every release must improve at least one of:
  - user trust
  - user comprehension
  - operator control
  - launch readiness

## 2A. Premium UI and UX guardrails

These rules apply to every roadmap update:

- Keep pages clean, calm, and premium.
- Do not fill pages just because data exists.
- Prefer progressive disclosure over always-visible detail.
- One primary story per screen, not five competing sections.
- Add new modules only if they materially improve understanding or action.
- Default to fewer cards, fewer colors, tighter copy, and clearer spacing.
- Dense is acceptable. Clutter is not.
- Explanations should be available when needed, but not constantly shouting.
- Performance/trust data should feel integrated into the product, not bolted on as dashboards.
- Every new surface should pass this test: does it feel more like a premium trading product, or more like an overstuffed admin page?

Design implication by update:
- Cash and Performance should emphasize summary first, drill-down second.
- Trust Layer should use clean accordions/drawers instead of long stacked information blocks.
- Onboarding should guide lightly, not trap the user in multi-step noise.
- Ticket Intelligence should improve clarity inside the existing ticket instead of expanding the page with extra clutter.
- Notifications should be ranked and sparse, not noisy.
- Operator surfaces can be denser, but still need hierarchy and restraint.

## 3. Current state

Already strong:
- live market board
- market detail + chart + ticket
- buy/sell flows
- admin lifecycle, resolution, settlement
- portfolio upgrade with open exposure, history, and improved visual hierarchy
- production deploy path, smoke checks, and operating runbooks

Still weak or incomplete:
- cashflow visibility over time
- per-market performance attribution
- trust and source framing on market pages
- first-trade guidance for testers
- notification/watchlist loop
- lightweight operator control plane for ongoing market quality

## 4. Official roadmap

## Update 1. Cash and Performance v1

**Goal:** make the portfolio feel like a real trading account, not just a snapshot page.

**Scope:**
- Cash activity ledger
  - starting balance
  - buys
  - sells
  - fees
  - settlement payouts
  - void refunds
- Performance summary
  - realized PnL
  - unrealized PnL
  - total PnL
  - markets traded
  - win rate
  - average return per settled market
- Per-market attribution
  - best market
  - worst market
  - realized PnL ranking
- Equity curve
  - account value over time
  - wallet cash vs open exposure split

**Why now:**
This is the highest-leverage next step after the portfolio redesign. Users still cannot fully explain their own account history.

**Done when:**
A tester can answer:
- What made me money?
- What lost me money?
- Why did my balance change?
- How am I doing overall?

## Update 2. Trust Layer v1

**Goal:** make every market feel explainable and defensible.

**Scope:**
- Cleaner trust block on market detail
- Source pack with clear hierarchy
  - primary sources
  - supporting sources
  - last updated timestamp
- Resolution block
  - what settles YES
  - what settles NO
  - what settles VOID
- Market quality signals
  - source freshness
  - operator-reviewed status
  - close time and expected resolution path
- Cleaner accordion/dropdown structure to reduce clutter

**Why now:**
Trust is one of the few things that can make this feel serious instead of just visually polished.

**Done when:**
A new tester can land on a market and immediately understand:
- why this market is live
- what evidence supports it
- how it will resolve

## Update 3. First Trade and Onboarding v1

**Goal:** increase tester conversion from first visit to first completed trade.

**Scope:**
- first-session onboarding refresh
- clearer paper-money explanation
- first-trade walkthrough
- trade success state with simple explanation
  - shares bought
  - avg price
  - fee paid
  - what must happen to win
- stronger empty states across portfolio and notifications

**Why now:**
After trust improves, the next bottleneck is activation. The product should not need a manual walkthrough for every tester.

**Done when:**
A new tester can sign in and make a first trade without asking questions in chat.

## Update 4. Ticket Intelligence v1

**Goal:** make the trade ticket smarter and more confidence-inspiring.

**Scope:**
- clearer quote breakdown
- better sell UX
- exposure-after-trade visibility
- stronger slippage and payout explanations
- position impact preview
- clearer distinction between probability display and cash consequences

**Why now:**
The market ticket is where trust turns into action. This is one of the highest-value conversion surfaces.

**Done when:**
A user understands the quote before they click confirm.

## Update 5. Notifications and Watchlist v1

**Goal:** create an actual follow-up loop so users return to the product for reasons other than curiosity.

**Scope:**
- watchlist / follow market
- notifications for:
  - market closing soon
  - market resolved
  - settlement completed
  - major price move
- cleaner notifications page ranking and grouping

**Why now:**
The product becomes stickier once users have reasons to come back.

**Done when:**
A tester can follow a market and receive meaningful product-triggered reminders.

## Update 6. Operator Control Plane Lite

**Goal:** make the demo feel operationally serious behind the scenes.

**Scope:**
- operator dashboard for:
  - closing soon markets
  - unresolved closed markets
  - resolved but unsettled markets
  - stale source review queue
  - automation/cron health
- lightweight quality flags for markets needing review
- simple audit visibility for recent operator actions

**Why now:**
This is the right "next level architecture" move after core user flows are stable. It upgrades the product from app demo to operating market desk.

**Done when:**
The operator can manage market quality and settlement flow from one control surface.

## Update 7. Launch Readiness Pack

**Goal:** convert the alpha into a clean private-testing product.

**Scope:**
- final launch-slate curation
- tester invite/onboarding checklist
- first-trade walkthrough script
- domain and trust polish checks
- launch QA pass on mobile and desktop
- final runbook freeze

**Why now:**
This is the release candidate step, not a feature step.

**Done when:**
We can confidently invite a private test cohort without caveats or manual patching.

## 5. Recommended order

If we keep updates narrow and sharp, the best order is:

1. Cash and Performance v1
2. Trust Layer v1
3. First Trade and Onboarding v1
4. Ticket Intelligence v1
5. Notifications and Watchlist v1
6. Operator Control Plane Lite
7. Launch Readiness Pack

## 6. Explicit non-priorities for now

These are **not** the next move:
- changing AMM math for the sake of novelty
- adding social/comment/community features
- public launch features
- mobile app work
- real-money mechanics
- complicated gamification or leaderboards
- overbuilding analytics before basic trust/performance clarity exists

## 7. My recommendation

If we want the cleanest sequence, we should build:

**Now:** Cash and Performance v1  
**Then:** Trust Layer v1  
**Then:** First Trade and Onboarding v1

That path keeps momentum, improves the user experience materially, and avoids random feature creep.
