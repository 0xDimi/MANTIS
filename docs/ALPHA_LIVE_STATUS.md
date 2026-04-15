# Alpha Live Status

Last updated: 2026-04-15 19:24 (EEST)

## Current phase
- Week 2 markets rebuild is complete
- Week 3 gate is fully closed
- Week 4 execution/ledger/portfolio/realtime gate is closed
- Week 5 admin/resolution/settlement gate is closed
- Week 6 QA/telemetry/ops/runbook/launch-readiness is closed
- Pre-UI simulation mode is active (2 open markets only, fast close windows today)

## Live build/run state
- Branch: `alpha`
- Build target: `npm run build`
- Canonical app: `https://xyz-labs-demo.vercel.app`
- Legacy assets: frozen in `public/legacy/*` as reference-only
- Active app surface: rebuilt Next routes (`/markets`, `/markets/[slug]`, `/portfolio`, `/admin/*`)
- AMM source of truth: `xyz_amm_package_v0`

## Complete
- Week 0 through Week 5 gates are closed end-to-end on runtime
- Production settlement loop is validated for both resolved payout and VOID refund
- Full production smoke automation now exists in `scripts/qa-smoke-alpha.sh`
  - covers auth, markets, quote, execute, portfolio, history, admin lifecycle, resolution, settlement
- Week 6 admin smoke helper added: `scripts/qa-smoke-admin-pack.mjs`
  - isolated smoke fixtures
  - lifecycle `draft -> open -> paused -> open -> closed`
  - YES resolution + settlement payout
  - VOID resolution + settlement refund
  - public readback + post-settlement portfolio cleanup checks
- Repo hardening migration added: `0018_profile_update_guardrails.sql`
- Runtime hardening applied and verified:
  - `0018_profile_update_guardrails.sql` applied on active Supabase runtime
  - disposable-tester escalation probe now blocked (`profiles.role` self-promotion prevented)
- Telemetry SDK wiring implemented in app code:
  - Sentry client + server instrumentation files (`instrumentation-client.ts`, `instrumentation.ts`, `app/global-error.tsx`)
  - PostHog client initialization provider (`components/telemetry-provider.tsx`)

## Latest verification result
- PASS `npm run typecheck`
- PASS `npm run test:week3`
- PASS `npm run test:week5`
- PASS `npm run build`
- PASS production smoke (`./scripts/qa-smoke-alpha.sh`) on canonical app:
  - `/api/health`
  - `/api/markets`
  - `/api/me`
  - `/api/portfolio/summary`
  - `/api/quotes/preview`
  - `/api/trades/execute`
  - `/api/trades/history`
  - `/api/admin/markets/[marketId]/status`
  - `/api/admin/resolution`
  - `/api/admin/settlement`
  - `/api/markets/[slug]` resolution/settlement readback
- PASS production admin-pack smoke with RLS probe enabled (`SMOKE_VERIFY_PROFILE_RLS=1`)
- PASS post-telemetry-wiring production regression rerun (`./scripts/qa-smoke-alpha.sh` + `SMOKE_VERIFY_PROFILE_RLS=1 node scripts/qa-smoke-admin-pack.mjs`)
- PASS `/api/health` telemetry readiness now reports full green for telemetry:
  - Sentry `envConfigured=true`, `sdkConfigured=true`
  - PostHog `envConfigured=true`, `sdkConfigured=true`

## In progress
- Final-product requirement remains locked: nickname update support
- Post-UI launch prep is now locked to controlled automation + tester first-trade walkthrough (no per-trade manual approval requirement).
- UI polish pass now includes full framework-driven redesign on live routes (commit `eea605b`):
  - shared shell/header with brand lockup, compact EN/EL switcher, and notification bell
  - IBM Plex Sans typography + new design tokens and refined dark gradient system
  - discover-first board on `/` and `/markets` with shelf tabs, 2-card featured swipe, category rail, and shared market cards
  - polished market detail top section with probability-first hero and trust-layer surfacing
  - trade ticket visual polish with segmented buy/sell + YES/NO controls and clear interaction-state chips
  - bilingual copy coverage extended across updated user-facing pages
- Header/navigation iteration applied per latest feedback (commit `5724387`):
  - larger MANTIS logo left, centered market search bar, portfolio/cash quick glance, EN/EL toggle, notification bell, profile icon
  - expanded `/more` knowledge page (how to trade, probability interpretation, resolution flow, risk notes)
  - added non-launch design sample markets (10+ preview rows) for UI feedback depth when live open-market count is low
- Market-card-focused polish pass applied per latest visual feedback (commit `e2d52ec`):
  - discover cards now render in a 3-column desktop grid (with responsive 2/1 collapse)
  - featured markets module enlarged with previous/next controls
  - market cards moved closer to Polymarket-like information density and YES/NO action framing while preserving MANTIS styling
  - removed highlighted top-copy clutter and tightened top-bar vertical spacing
- Discover/detail hierarchy refactor pass applied (commit `0e05c78`):
  - discover flow reduced to shelves → featured → categories → market grid (less wrapper-card feel)
  - featured module tightened with lead-card + peek behavior, compact meta, and restrained controls
  - shelf/category rails de-emphasized for inactive states (active-only emphasis)
  - market cards tightened to single-surface hierarchy with cleaner bottom action/meta rows
  - detail page above-the-fold rebuilt around question title + compact summary row + chart/ticket prominence
  - generic AI-style headings removed; rules/sources/resolution moved to lighter secondary sections
  - internal/smoke/test market slugs are filtered from discover browse surfaces

## Just completed
- Pre-UI two-market live simulation completed successfully end-to-end via `scripts/sim-auto-resolution.mjs`:
  - `gre-weather-athens-heatwave`: auto-closed -> resolved YES -> settled
  - `gre-weather-thessaloniki-heavy-rain`: auto-closed -> resolved VOID -> settled
  - Worker exit: `auto-resolution completed for all configured markets` (code 0)
- UI polish framework pass deployed to canonical app (`xyz-labs-demo.vercel.app`) via Vercel production deploy from `alpha` (`eea605b`).
- Header/navigation + discover depth follow-up deployed to canonical app from `alpha` (`5724387`).
- Market-card-focused follow-up deployed to canonical app from `alpha` (`e2d52ec`).
- Discover/detail hierarchy pass deployed to canonical app from `alpha` (`0e05c78`).
- Follow-up scope guard deployed from `alpha` (`9b3e422`) to keep this pass UI-only (no API/auth/trade/data-flow contract changes).

## Simulation mode (active)
- Open markets reduced from 12 to 2 for fast-cycle verification:
  - `gre-weather-athens-heatwave` (close in ~1h from activation)
  - `gre-weather-thessaloniki-heavy-rain` (close in ~2h from activation)
- Simulation fee lowered to `50 bps` on both open markets (from `200 bps`) to reduce friction during rapid-cycle testing.
- Other launch-slate markets switched to `draft` (soft hide, not deleted)
- Immediate recheck after switch: PASS `qa-smoke-alpha` on production with `count=2`

## Ops runbook
- Operator runbook finalized: `docs/ALPHA_OPERATOR_RUNBOOK.md`

## Current blockers / needs
- No functional blockers from Week 6 remain.
- Active execution now: complete same-day simulation close -> resolution -> settlement checks, then start UI polish.
