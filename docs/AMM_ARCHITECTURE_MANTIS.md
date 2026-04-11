# AMM Architecture, MANTIS audit snapshot

## What must hold from source-of-truth

### 1. Market structure
xyz runs a centralized binary AMM, not a CLOB and not peer matching. Users trade against the platform, server-side only, with quote-confirm execution.

```text
client ticket
  -> POST /api/quotes/preview
    -> read markets + market_state
    -> LMSR quote from (q_yes, q_no, b, fee_bps)
    -> hash quote against exact state snapshot
  -> user confirms
  -> POST /api/trades/execute
    -> recompute quote from latest state
    -> verify quote hash + exact state snapshot
    -> RPC executes atomically
      -> lock market_state, wallet, position
      -> debit/credit wallet
      -> update weighted-average position basis
      -> append trade + ledger rows
      -> mutate q_yes/q_no and prices
```

### 2. Pricing math
Source-of-truth is fixed-liquidity binary LMSR with explicit external fees.

- Cost: `C(q_yes, q_no) = b * ln(exp(q_yes / b) + exp(q_no / b))`
- Price: `p_yes = sigmoid((q_yes - q_no) / b)` and `p_no = 1 - p_yes`
- YES buy by gross cash `k`: `p1 = 1 - (1 - p0) * exp(-k / b)`
- NO buy by gross cash `k`: `p1 = p0 * exp(-k / b)`
- Gross trade cash is always the LMSR cost delta, fees are applied after that

### 3. Guardrails
These must be enforced, not just displayed.

- probability floor / ceiling before resolution
- max single trade
- max user exposure per market
- no trading unless market is open
- no sell beyond holdings
- requote on any stale market state

### 4. Settlement semantics
Long-only alpha positions carry weighted-average open cost basis including buy-side fees.

- buy: add shares and add total debit to side cost basis
- partial sell: release proportional basis, realize `net_credit - released_basis`
- YES/NO resolution: winning side pays `€1/share`
- VOID: refund remaining open cost basis

The demo repo currently has the accounting primitives and resolution schema, but not the full settlement worker/path yet.

## Source-of-truth to implementation mapping

| SoT item | Source ref | Implementation file/line |
| --- | --- | --- |
| Binary LMSR cost function and marginal price | `01_XYZ_Labs_Centralized_Binary_AMM_Spec_v0.md`, sections 6-7 | `lib/amm-v0.ts:105-117` |
| Share-based quote path uses LMSR cost delta and blocks negative market state | `01_...`, sections 7-9; `03_xyz_amm_reference/lmsr.ts` | `lib/amm-v0.ts:166-215` |
| Cash-based quote closed forms for buy/sell | `01_...`, section 7; `03_xyz_amm_reference/lmsr.ts` | `lib/amm-v0.ts:217-257` |
| UI-facing input modes, buy by total cash / sell by shares | `01_...`, section 9 | `lib/amm-v0.ts:259-311`, `app/api/quotes/preview/route.ts:32-49`, `app/api/trades/execute/route.ts:31-50` |
| Probability floor/ceiling and alpha trade caps | `08_AMM_V0_BUILD_READY_SPEC.md`, section 14 | `lib/alpha-guardrails.ts:1-6`, `lib/amm-v0.ts:62-69`, `app/api/quotes/preview/route.ts:120-181`, `app/api/trades/execute/route.ts:132-186` |
| Market state stores `b`, `q_yes`, `q_no`, prices | `01_...`, section 5 | `supabase/migrations/0001_alpha_foundation.sql:49-80` |
| Quote-confirm flow with exact state snapshot protection | `01_...`, section 8 | `app/api/quotes/preview/route.ts:97-199`, `app/api/trades/execute/route.ts:109-186`, `lib/quote-hash.ts:3-19`, `supabase/migrations/0010_lmsr_state_guardrails.sql:111-149` |
| Long-only positions, weighted-average basis, realized PnL on sell | `01_...`, sections 8, 11, 12 | `supabase/migrations/0001_alpha_foundation.sql:114-137`, `supabase/migrations/0010_lmsr_state_guardrails.sql:147-233` |
| Atomic execution updates wallet, position, trade ledger, and market state | `01_...`, sections 8, 10, 11 | `supabase/migrations/0010_lmsr_state_guardrails.sql:147-300` |
| Resolution metadata and VOID-rule surface | `08_AMM_V0_BUILD_READY_SPEC.md`, sections 12-14 | `supabase/migrations/0001_alpha_foundation.sql:49-67`, `supabase/migrations/0001_alpha_foundation.sql:139-148`, `app/api/markets/[slug]/route.ts:9-57` |

## Audit note
Biggest architecture correction in this pass: the demo quote engine now prices from exact LMSR state (`q_yes`, `q_no`, `b`) instead of the old heuristic `impact = amount / depth` approximation. That closes the main mismatch with the xyz package.
