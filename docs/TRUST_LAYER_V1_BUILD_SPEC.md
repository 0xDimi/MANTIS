# Trust Layer v1 Build Spec

**Project:** MANTIS paper-trading alpha  
**Roadmap item:** Update 2  
**Status:** build-ready  
**Date:** 2026-05-21  

## Objective

Make every market detail page feel explainable, defensible, and clean without turning the page into an operations dashboard.

The user should quickly understand:

- why the market is live
- which sources support it
- what settles YES, NO, or VOID
- when trading closes
- whether the market has been reviewed recently enough to feel trustworthy

## Product Principles

- Trust should be visible before it is verbose.
- Source and resolution detail should use progressive disclosure.
- The market question, chart, and trade ticket remain the primary visual hierarchy.
- No new AMM, trading, wallet, or settlement behavior in this update.
- No heavy admin-style tables on the public market detail page.

## In Scope

### Market Detail UI

- Replace the old tabbed trust panel with:
  - compact trust overview
  - source pack disclosure
  - resolution rules disclosure
  - review status disclosure
- Show quality signals:
  - source pack status
  - operator review status
  - market metadata freshness
  - expected resolution path
- Keep the component visually quiet and premium:
  - restrained borders
  - no loud warning blocks unless needed
  - no stacked explanation wall

### Data Contract

- Expose `markets.updated_at` through:
  - `/api/markets/[slug]`
  - `MarketDetailRead`
- Reuse existing fields:
  - `source_primary`
  - `source_fallback`
  - `void_rule`
  - `close_time`
  - `resolution_time`
  - `status`
  - `resolution`
  - `settlement`

### Copy

- Plain-English trust copy.
- Greek localized equivalents for all newly visible labels.
- Generic YES/NO settlement copy unless a later market-rules schema is introduced.

## Out of Scope

- New source registry table.
- Evidence uploads.
- Watchlist or notification work.
- First-trade onboarding.
- Ticket quote intelligence.
- Admin control plane changes.
- Market slate changes.

## Acceptance Criteria

- A new tester can understand source hierarchy and resolution logic within 10 seconds of landing on a market detail page.
- Trust layer does not push the trade ticket below the fold on desktop.
- Mobile layout remains single-column and readable, with no horizontal overflow.
- English and Greek detail pages render without missing labels.
- Typecheck, Week 3, Week 5, Week 6, and production build pass locally before push.
- Visual QA passes on desktop and mobile before push.

## Implementation Plan

1. Add `updatedAt` to market detail API and read model.
2. Rebuild `MarketTrustTabs` into a clean trust layer disclosure module while keeping the component name to minimize route churn.
3. Pass `updatedAt`, `yesLabel`, and `noLabel` from market detail page.
4. Replace old trust CSS with compact overview and disclosure styles.
5. Run verification:
   - `npm run typecheck`
   - `npm run test:week3`
   - `npm run test:week5`
   - `npm run test:week6`
   - `npm run build`
   - local visual check on desktop and mobile

## Follow-Up Candidates

- Market-specific YES/NO criteria fields if trust copy needs less generic settlement language.
- Source registry with URLs, source owner, and freshness SLA.
- Operator-reviewed badge backed by an audit event rather than derived market metadata.
