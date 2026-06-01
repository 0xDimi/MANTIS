# 10 — Seed Markets and Localization

## 1. Rebuilt market-writing principle

Grouped Binary Events v1 should start with **independent, multi-YES event clusters**.

That means:

- each child market can resolve YES or NO independently;
- more than one child can resolve YES;
- all children can resolve YES;
- all children can resolve NO;
- there is no single winning outcome;
- child YES prices are not expected to sum to 100%.

## 2. Do not use these as v1 public alpha grouped events

These belong to true categorical or later controlled experiments:

```text
Which party will lead the next national poll?
Which team will finish first in Group X?
Which company will have the highest market cap at date X?
Which candidate will win a runoff?
Which film will win Best Picture?
Who will be the next prime minister?
Who will win the election?
```

They are single-winner or mutually exclusive. They create the price-sum/coherence problem that v1 is deliberately avoiding.

## 3. Strong v1 event types

Use event types where independent child markets are natural:

```text
Which tokens will reach a new all-time high by date X?
Which tokens will outperform BTC by date X?
Which parties will poll above X% in the next Source Y poll?
Which central banks will cut rates before date X?
Which companies will close above market cap / price threshold X by date Y?
Which teams will win their next matchday fixture?
Which macro indicators will print above threshold in the next release?
Which films will cross box-office threshold X by date Y?
Which apps will reach top-10 ranking in category X by date Y?
```

Caution: “which teams will qualify from a group” may have exactly K winners. That is not a single-winner market, but it still introduces expected-count coherence. Keep it out of v1 public alpha unless explicitly flagged as a later bounded-count experiment.

## 4. Template 1 — Tokens reach ATH

### Parent event

English:

```text
Which tokens will reach a new all-time high by 31 Dec 2026?
```

Greek:

```text
Ποια tokens θα κάνουν νέο ιστορικό υψηλό έως τις 31 Δεκ 2026;
```

### Child markets

English:

```text
Will BTC reach a new all-time high by 31 Dec 2026?
Will ETH reach a new all-time high by 31 Dec 2026?
Will SOL reach a new all-time high by 31 Dec 2026?
Will BNB reach a new all-time high by 31 Dec 2026?
Will LINK reach a new all-time high by 31 Dec 2026?
```

Greek:

```text
Θα κάνει το BTC νέο ιστορικό υψηλό έως τις 31 Δεκ 2026;
Θα κάνει το ETH νέο ιστορικό υψηλό έως τις 31 Δεκ 2026;
Θα κάνει το SOL νέο ιστορικό υψηλό έως τις 31 Δεκ 2026;
Θα κάνει το BNB νέο ιστορικό υψηλό έως τις 31 Δεκ 2026;
Θα κάνει το LINK νέο ιστορικό υψηλό έως τις 31 Δεκ 2026;
```

### Rule

English:

```text
Each child market resolves independently. A token resolves YES if the primary source records a new all-time high in USD for that token at any time from market open until 23:59 UTC on 31 Dec 2026. A token resolves NO if no new all-time high is recorded by the deadline. If the primary source is unavailable or materially inconsistent, the fallback source is used. If neither source can support a reliable determination, only the affected child market voids unless the source issue affects all children.
```

Greek:

```text
Κάθε επιμέρους αγορά επιλύεται ανεξάρτητα. Ένα token κλείνει στο ΝΑΙ αν η κύρια πηγή καταγράψει νέο ιστορικό υψηλό σε USD για το συγκεκριμένο token οποιαδήποτε στιγμή από το άνοιγμα της αγοράς έως τις 23:59 UTC στις 31 Δεκ 2026. Κλείνει στο ΟΧΙ αν δεν καταγραφεί νέο ιστορικό υψηλό έως την προθεσμία. Αν η κύρια πηγή δεν είναι διαθέσιμη ή παρουσιάζει ουσιώδη ασυνέπεια, χρησιμοποιείται η εφεδρική πηγή. Αν καμία πηγή δεν επιτρέπει αξιόπιστη επιβεβαίωση, ακυρώνεται μόνο η επηρεαζόμενη επιμέρους αγορά, εκτός αν το πρόβλημα αφορά όλες τις επιμέρους αγορές.
```

### Example initial child YES prices

```text
BTC: 68%
ETH: 54%
SOL: 41%
BNB: 24%
LINK: 18%
```

No sum target applies.

## 5. Template 2 — Parties poll above threshold

### Parent event

English:

```text
Which parties will poll above 10% in the next national poll from [Source]?
```

Greek:

```text
Ποια κόμματα θα καταγράψουν πάνω από 10% στην επόμενη πανελλαδική δημοσκόπηση της [Πηγή];
```

### Child markets

English:

```text
Will ND poll above 10% in the next national poll from [Source]?
Will PASOK poll above 10% in the next national poll from [Source]?
Will SYRIZA poll above 10% in the next national poll from [Source]?
Will KKE poll above 10% in the next national poll from [Source]?
Will Greek Solution poll above 10% in the next national poll from [Source]?
```

Greek:

```text
Θα καταγράψει η ΝΔ πάνω από 10% στην επόμενη πανελλαδική δημοσκόπηση της [Πηγή];
Θα καταγράψει το ΠΑΣΟΚ πάνω από 10% στην επόμενη πανελλαδική δημοσκόπηση της [Πηγή];
Θα καταγράψει ο ΣΥΡΙΖΑ πάνω από 10% στην επόμενη πανελλαδική δημοσκόπηση της [Πηγή];
Θα καταγράψει το ΚΚΕ πάνω από 10% στην επόμενη πανελλαδική δημοσκόπηση της [Πηγή];
Θα καταγράψει η Ελληνική Λύση πάνω από 10% στην επόμενη πανελλαδική δημοσκόπηση της [Πηγή];
```

### Rule

English:

```text
Each child market resolves independently based on the first eligible national voting-intention poll from [Source] published after [date/time]. A party resolves YES if its reported voting-intention percentage is strictly above 10.0%. It resolves NO if it is 10.0% or below, or if the party is not separately reported by the source. If no eligible poll is published by [deadline], all children void.
```

Greek:

```text
Κάθε επιμέρους αγορά επιλύεται ανεξάρτητα με βάση την πρώτη επιλέξιμη πανελλαδική δημοσκόπηση πρόθεσης ψήφου της [Πηγή] που θα δημοσιευθεί μετά τις [ημερομηνία/ώρα]. Ένα κόμμα κλείνει στο ΝΑΙ αν το δημοσιευμένο ποσοστό του είναι αυστηρά πάνω από 10,0%. Κλείνει στο ΟΧΙ αν είναι 10,0% ή χαμηλότερο, ή αν το κόμμα δεν αναφέρεται ξεχωριστά από την πηγή. Αν δεν δημοσιευθεί επιλέξιμη δημοσκόπηση έως την [προθεσμία], ακυρώνονται όλες οι επιμέρους αγορές.
```

## 6. Template 3 — Central banks cut rates

### Parent event

English:

```text
Which central banks will cut rates before 30 Sep 2026?
```

Greek:

```text
Ποιες κεντρικές τράπεζες θα μειώσουν τα επιτόκια πριν από τις 30 Σεπ 2026;
```

### Child markets

```text
Will the ECB cut rates before 30 Sep 2026?
Will the Fed cut rates before 30 Sep 2026?
Will the Bank of England cut rates before 30 Sep 2026?
Will the Swiss National Bank cut rates before 30 Sep 2026?
```

Greek:

```text
Θα μειώσει η ΕΚΤ τα επιτόκια πριν από τις 30 Σεπ 2026;
Θα μειώσει η Fed τα επιτόκια πριν από τις 30 Σεπ 2026;
Θα μειώσει η Τράπεζα της Αγγλίας τα επιτόκια πριν από τις 30 Σεπ 2026;
Θα μειώσει η Εθνική Τράπεζα της Ελβετίας τα επιτόκια πριν από τις 30 Σεπ 2026;
```

### Rule

English:

```text
Each child resolves YES if the relevant central bank announces and implements at least one reduction in its main policy rate before 23:59 local time on 30 Sep 2026. It resolves NO if no such reduction occurs by the deadline. Official central bank publications are the primary source.
```

## 7. Template 4 — Companies above threshold

### Parent event

English:

```text
Which companies will close above $1T market cap on [date]?
```

Greek:

```text
Ποιες εταιρείες θα κλείσουν πάνω από $1T κεφαλαιοποίηση στις [ημερομηνία];
```

### Child markets

```text
Will Nvidia close above $1T market cap on [date]?
Will Apple close above $1T market cap on [date]?
Will Microsoft close above $1T market cap on [date]?
Will Amazon close above $1T market cap on [date]?
Will Alphabet close above $1T market cap on [date]?
```

Use only with a clearly defined data source and market-close timestamp.

## 8. Template 5 — Matchday winners across different fixtures

### Parent event

English:

```text
Which teams will win their next league match?
```

Greek:

```text
Ποιες ομάδες θα κερδίσουν τον επόμενο αγώνα πρωταθλήματος;
```

This is acceptable only when each child refers to a different fixture and the outcomes are not mutually exclusive.

Child example:

```text
Will Olympiacos win their next league match?
Will Panathinaikos win their next league match?
Will PAOK win their next league match?
Will AEK win their next league match?
```

Note: avoid grouping teams that are playing each other in the same fixture unless the event is explicitly an independent cluster of match questions and users understand the fixture relationships.

## 9. Initial probability guidance

For independent clusters:

```text
Do not sum initial probabilities to 100%.
Do not require an Other outcome.
Do not show total probability.
Do not launch all children at 50/50 unless justified.
```

Recommended child-level guardrails:

```text
Default child initial probability band: 10%–90%
Admin note required: 5%–10% or 90%–95%
Super-admin override: below 5% or above 95%
```

Optional admin metric:

```text
expected_yes_count = sum(child initial probabilities)
```

## 10. Greek copy glossary

| English | Greek |
|---|---|
| Grouped YES/NO event | Ομαδοποιημένο γεγονός ΝΑΙ/ΟΧΙ |
| Independent cluster | Ανεξάρτητη ομάδα αγορών |
| Child market | Επιμέρους αγορά |
| Multiple can resolve YES | Περισσότερες από μία μπορούν να κλείσουν στο ΝΑΙ |
| Each row resolves independently | Κάθε γραμμή επιλύεται ανεξάρτητα |
| Selected market | Επιλεγμένη αγορά |
| YES price | Τιμή ΝΑΙ |
| NO price | Τιμή ΟΧΙ |
| Expected YES count | Αναμενόμενος αριθμός ΝΑΙ |
| Void all | Ακύρωση όλων |
| Child void | Ακύρωση επιμέρους αγοράς |
| Resolution source | Πηγή επίλυσης |
| Fallback source | Εφεδρική πηγή |
| Close time | Λήξη συναλλαγών |
| Determination time | Χρόνος επιβεβαίωσης |
| Buy YES | Αγορά ΝΑΙ |
| Buy NO | Αγορά ΟΧΙ |
| Sell | Πώληση |
| Shares | Μερίδια |
| Max loss | Μέγιστη απώλεια |
| Payout if correct | Πληρωμή αν επαληθευτεί |

## 10A. Localization storage rule

Grouped-event copy must be stored as data:

```text
market_event_localizations: parent title, description, source, rule, void rule, education copy
market_event_outcome_localizations: child label, question, description, source/rule overrides
```

The existing `lib/market-copy.ts` slug map is only a standalone-market fallback. It must not become the source of truth for grouped events.

Before an event can open:

```text
[ ] parent EN copy exists
[ ] parent EL copy exists
[ ] every child EN copy exists
[ ] every child EL copy exists
[ ] /api/events?lang=en and /api/events?lang=el return localized parent and child copy
[ ] /api/events/:slug?lang=en and /api/events/:slug?lang=el return localized parent and child copy
```

Avoid in v1 public copy:

| Avoid | Reason |
|---|---|
| Winning outcome / Νικήτρια επιλογή | Implies single winner |
| Leading outcome / Πρώτη επιλογή | Implies rank/winner |
| Prices sum to 100% / Οι τιμές αθροίζουν στο 100% | False for independent clusters |
| Which one / Ποιο από αυτά | Can imply one answer |

## 11. Required explanation copy

English:

```text
This grouped event contains several related YES/NO markets. Each row resolves independently. More than one row can resolve YES, and it is possible that none resolve YES. The price shown on each row is the current tradable YES price for that specific market.
```

Greek:

```text
Αυτό το ομαδοποιημένο γεγονός περιλαμβάνει πολλές σχετικές αγορές ΝΑΙ/ΟΧΙ. Κάθε γραμμή επιλύεται ανεξάρτητα. Περισσότερες από μία γραμμές μπορούν να κλείσουν στο ΝΑΙ, και είναι πιθανό καμία να μην κλείσει στο ΝΑΙ. Η τιμή που εμφανίζεται σε κάθε γραμμή είναι η τρέχουσα τιμή ΝΑΙ για τη συγκεκριμένη αγορά.
```

## 12. Seed set recommendation for first alpha push

Use 4 grouped events:

```text
1. Tokens ATH by year-end
2. Parties above threshold in next poll
3. Central banks cut rates before date
4. Companies above threshold by date
```

Each event should have 4–6 child markets.

This gives the demo a multi-outcome feel while avoiding single-winner mechanics.
