# MANTIS — Grouped Binary Events v1 Independent Clusters Spec Pack

**Status:** Build-ready replacement spec
**Date:** 2026-05-28
**Pre-build cleanup:** 2026-05-31
**Owner:** XYZ Labs / MANTIS
**Supersedes:** the previous Grouped Binary Events v1 pack that treated v1 primarily as categorical-looking single-winner events.

## Executive decision

MANTIS will ship **Grouped Binary Events v1 as Independent Clusters**.

> One parent event groups multiple existing binary YES/NO child markets. Each child market resolves independently. More than one child can resolve YES. More than one child can resolve NO. All children can resolve YES. All children can resolve NO.

This rebuild intentionally removes the previous v1 assumption that grouped event prices should usually sum near 100%. That assumption only belongs to single-winner categorical or mutually exclusive events. It does **not** belong to independent grouped binary clusters.

## What changed from the previous pack

| Area | Old v1 direction | Rebuilt v1 direction |
|---|---|---|
| Primary event type | Single-winner grouped events | Independent multi-YES / multi-NO clusters |
| Resolution | Parent chooses one winner; all others NO | Admin resolves each child YES / NO / VOID |
| Price-sum rule | Child YES prices should launch near 100% | No price-sum target; prices are independent |
| User copy | “Prices may not sum to 100%” | “Multiple markets can resolve YES” |
| Risk concern | Sum-to-100 coherence and basket arbitrage | Event-level aggregate exposure and worst-case child liability |
| First seed markets | Poll leader, award winner, group winner | Tokens ATH, parties above threshold, central banks cut rates, companies above threshold |
| Future path | True categorical later | True categorical later, but only for single-winner markets |

## Pack contents

| File | Purpose |
|---|---|
| `00_README.md` | This overview and decision summary |
| `01_PRODUCT_DECISION_AND_SCOPE.md` | Product decision, terminology, in/out of scope |
| `02_DOMAIN_MODEL_AND_SCHEMA.md` | Domain model, data rules, SQL model explanation |
| `03_API_SPEC.md` | Public, authenticated, and admin API contracts |
| `04_TRADING_AND_MARKET_MECHANICS.md` | Trading semantics, pricing, positions, settlement semantics |
| `05_UI_UX_SPEC.md` | Event cards, event detail, trade ticket, portfolio grouping, copy |
| `06_ADMIN_RESOLUTION_AND_OPS.md` | Creation, review, open, close, batch resolution, voiding, audit |
| `07_RISK_ANALYTICS_AND_RECONCILIATION.md` | Event-level risk, exposure caps, dashboards, reconciliation |
| `08_QA_AND_ACCEPTANCE_TEST_PLAN.md` | Unit, integration, E2E, release gates |
| `09_IMPLEMENTATION_BACKLOG.md` | Build tickets and PR sequence |
| `10_SEED_MARKETS_AND_LOCALIZATION.md` | Rebuilt seed market catalog and Greek/English copy |
| `11_OPERATOR_BOUNDARY_AND_ROLLOUT.md` | Operator boundary, feature flags, rollout, rollback |
| `12_ADR_GBE_V1_INDEPENDENT_CLUSTERS.md` | Architecture decision record |
| `13_MIGRATION_FROM_OLD_GBE_SPEC.md` | What to delete, keep, rename, and defer from the prior spec |
| `supabase_migration_gbe_v1_independent_clusters.sql` | Draft additive Supabase/Postgres migration |
| `MANTIS_GBE_v1_Independent_Clusters_Consolidated_Spec.md` | Single-file merged version |

## Implementation readiness locks

Before development starts, the implementation must honor these locks:

- Seed child `q_yes/q_no` from `initial_probability`; the current AMM does not price from `virtual_q_*`.
- Enforce event exposure atomically inside trade execution, not only during quote preview.
- Store grouped-event EN/EL copy in event/outcome localization tables; do not extend slug-only hard-coded copy as the source of truth.
- Use `profiles.id` for event/admin FK fields and `auth.users.id` for trading/wallet/position ownership.
- Enable RLS and public/server read policies for event read surfaces; keep event writes server/admin only.
- Validate that every batch child belongs to the same parent event before applying resolutions.
- If an older GBE table exists, repair it with explicit `alter table add column if not exists`; `create table if not exists` is not enough.

## Non-negotiable v1 product truth

Grouped Binary Events v1 are **not** true categorical markets.

The UI can group related questions, but it must be clear that:

- every row is a separate YES/NO market;
- every row has its own tradable YES and NO price;
- multiple rows can resolve YES;
- multiple rows can resolve NO;
- prices are not expected to sum to 100%;
- there is no single winner at the parent event level.

## Recommended first PR sequence

```text
GBE-000 Replace old single-winner assumptions in docs/copy
GBE-001 Add independent-cluster event schema
GBE-002 Add event domain types and validators
GBE-003 Add AMM initial probability anchoring
GBE-004 Add event creation admin flow with EN/EL localization and child binary markets
GBE-005 Add read-only event list/detail API
GBE-006 Add event card and independent-cluster event detail UI
GBE-007 Add selected-child trade ticket integration with atomic event exposure cap
GBE-008 Add batch child-resolution workflow
GBE-009 Add event-level portfolio grouping
GBE-010 Add event risk dashboard and exposure caps
GBE-011 Add E2E tests and reconciliation gates
```

## Release definition

GBE v1 Independent Clusters is releasable when:

- admin can create one parent event with 3–8 child YES/NO markets;
- each child remains a standard MANTIS binary market;
- users can trade any child via the existing quote-confirm ticket;
- child initial probabilities match first visible AMM prices;
- event exposure caps cannot be bypassed by parallel child trades;
- parent and child copy exists in English and Greek before opening;
- event UI clearly states that multiple markets can resolve YES;
- event UI does not show or imply a 100% probability distribution;
- admin can resolve child markets independently in one batch workflow;
- event-level portfolio groups positions under the parent;
- risk dashboard shows aggregate child exposure, not price-sum coherence;
- QA proves multiple YES, multiple NO, all YES, all NO, mixed, and void-all cases.
