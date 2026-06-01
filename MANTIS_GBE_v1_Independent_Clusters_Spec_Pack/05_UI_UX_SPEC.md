# 05 — UI / UX Spec

## 1. UX objective

Make grouped events feel richer than standalone binary markets while keeping the contract understandable.

The user should understand this in under 5 seconds:

```text
This page contains several related YES/NO markets.
More than one can resolve YES.
I can trade each row separately.
```

## 2. Discover event card

Card fields:

```text
Event title
Category
Close time
Top 3–5 child rows with YES price
Child count
Volume / activity
Education chip: “Multiple can resolve YES”
```

Example:

```text
Which tokens will reach a new ATH by year-end?

BTC  68¢ YES
ETH  54¢ YES
SOL  41¢ YES
+2 more

Multiple can resolve YES · Closes 31 Dec
```

Greek:

```text
Ποια tokens θα κάνουν νέο ιστορικό υψηλό έως το τέλος του έτους;

BTC  68¢ ΝΑΙ
ETH  54¢ ΝΑΙ
SOL  41¢ ΝΑΙ
+2 ακόμα

Περισσότερα από ένα μπορούν να κλείσουν στο ΝΑΙ · Λήξη 31 Δεκ
```

## 3. Event detail page layout

Desktop:

```text
[Header]
Title
Subtitle / short explanation
Status, close time, source
Education banner

[Left column]
Outcome row table
Rules panel
Activity / related events

[Right column]
Selected child trade ticket
Selected child mini chart
User position in selected child
```

Mobile:

```text
Header
Education banner
Outcome row list
Tap row -> bottom-sheet trade ticket
Rules accordion
```

## 4. Header copy

English:

```text
Multiple markets can resolve YES.
Each row is a separate YES/NO market with its own price.
```

Greek:

```text
Περισσότερες από μία αγορές μπορούν να κλείσουν στο ΝΑΙ.
Κάθε γραμμή είναι ξεχωριστή αγορά ΝΑΙ/ΟΧΙ με δική της τιμή.
```

## 5. Outcome row

Each row should show:

```text
Outcome label
Outcome description or child question preview
YES price
Optional 24h move
Volume / activity
User position chip if held
Trade button
```

Example:

```text
BTC
Will BTC reach a new ATH by 31 Dec 2026?
68¢ YES  ·  +4¢  ·  €1.2k vol  ·  Trade
```

Do not show:

```text
% of total
normalized probability
rank as if one winner must win
sum of row prices
```

## 6. Trade ticket behavior

The trade ticket is the existing binary ticket, but with event context.

Above the ticket, show:

```text
Selected market: BTC reaches ATH
Part of: Which tokens will reach ATH by year-end?
```

Ticket controls:

```text
Buy / Sell
YES / NO
Amount
Quote summary
Fee
Shares
Max loss
Payout if correct
```

For independent events, keep NO visible in the detailed ticket. Hiding NO only makes sense for single-winner categorical-looking events; v1 is explicitly not that.

## 7. Portfolio grouping

Portfolio should group child positions under the event.

Example:

```text
Which tokens will reach ATH by year-end?
Total market value: €84.20
Unrealized P/L: +€9.40

BTC YES   50 shares   Avg 61¢   Now 68¢   +€3.50
ETH NO    30 shares   Avg 42¢   Now 46¢   -€1.20
SOL YES   20 shares   Avg 35¢   Now 41¢   +€1.20
```

## 8. Rules panel

The event rules panel should have two levels:

### Parent rule

Explains shared timing, source, and void policy.

### Child rule

Each row may have a specific threshold or definition.

Example:

```text
Parent: Prices are checked against CoinGecko ATH data and exchange reference data as of 23:59 UTC on 31 Dec 2026.
Child BTC: Resolves YES if BTC prints a new all-time high in USD before the deadline.
```

## 9. Copy rules

Use:

```text
grouped YES/NO event
related markets
child market
multiple can resolve YES
selected market
```

Avoid:

```text
winner
winning outcome
losing outcomes
probability distribution
sum of probabilities
which one will win
```

## 10. Public education module

English:

```text
How this grouped event works

This page groups several related YES/NO markets. Each row resolves independently. More than one row can resolve YES, and it is also possible that none resolve YES. The price shown on each row is the current tradable YES price for that specific market.
```

Greek:

```text
Πώς λειτουργεί αυτό το ομαδοποιημένο γεγονός

Αυτή η σελίδα ομαδοποιεί πολλές σχετικές αγορές ΝΑΙ/ΟΧΙ. Κάθε γραμμή επιλύεται ανεξάρτητα. Περισσότερες από μία γραμμές μπορούν να κλείσουν στο ΝΑΙ, και είναι επίσης πιθανό καμία να μην κλείσει στο ΝΑΙ. Η τιμή που εμφανίζεται σε κάθε γραμμή είναι η τρέχουσα τιμή ΝΑΙ για τη συγκεκριμένη αγορά.
```

Localization implementation lock:

```text
Grouped-event UI must read parent and child copy from event localization tables.
The existing slug-based Greek fallback is acceptable for standalone markets only.
No grouped event can be opened until EN and EL copy exists for the parent and every child row.
```

## 11. Admin/operator labeling

Admin screens should label event type clearly:

```text
Grouped Binary Event — Independent Cluster
Resolution: Child-by-child
Price sum: Not applicable
```

Greek admin label:

```text
Ομαδοποιημένο δυαδικό γεγονός — ανεξάρτητη ομάδα
Επίλυση: ανά επιμέρους αγορά
Άθροισμα τιμών: δεν εφαρμόζεται
```

## 12. Accessibility and clarity

- Each outcome row must be keyboard selectable.
- Price movement must not rely only on color.
- Education chip must be visible on first visit.
- Event rows must expose child question text to screen readers.
- The trade ticket must announce selected child market changes.
