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
