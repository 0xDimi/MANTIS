# QA Smoke Checks for Alpha

`./scripts/qa-smoke-alpha.sh` is the repeatable Week 6 / production smoke pack for the live alpha API path.

## What it validates

1. `GET /api/health` returns `status=ok`
   - also checks telemetry readiness flags (Sentry + PostHog env/sdk configured)
2. `GET /api/markets` returns at least one market
   - and selected market has DB-backed detail on `GET /api/markets/[slug]`
3. Authenticated tester flow works end to end:
   - `GET /api/me`
   - `GET /api/portfolio/summary`
   - `POST /api/quotes/preview`
   - `POST /api/trades/execute`
   - `GET /api/markets/[slug]` after execution to confirm market-state reflection (`last_trade_at`, volume)
   - `GET /api/portfolio/summary` after execution
   - `GET /api/trades/history`
4. Admin lifecycle / resolution / settlement paths work on isolated smoke fixtures:
   - `POST /api/admin/markets/[marketId]/status` for `draft -> open -> paused -> open -> closed`
   - `POST /api/admin/resolution` for both `YES` and `VOID`
   - `POST /api/admin/settlement` for resolved payout and VOID refund
   - public readback on `GET /api/markets/[slug]`
   - trader portfolio reflection after settlement clears the smoke exposure
5. AMM behavior stays aligned with the `xyz_amm_package_v0` assumptions:
   - YES/NO prices remain complementary
   - quote state matches LMSR-style derivation from `qYes`, `qNo`, and `depth`
   - buy/sell direction moves probability the correct way
   - average fill stays between pre-trade and post-trade side price
   - fee-on-gross math still reconciles through execute, wallet delta, and trade history

The script exits non-zero on the first failure and prints concise `PASS` / `FAIL` checkpoints.

By default the script now also runs the Week 5 admin pack through `scripts/qa-smoke-admin-pack.mjs`. Set `SMOKE_INCLUDE_ADMIN_PACK=0` only when you intentionally want the lighter auth/trading-only smoke path.

## Tester account strategy

Use a **dedicated smoke tester account**, not a personal account.

Do not hardcode secrets in the repo. Inject them at runtime from a secret manager, CI secret store, or a local shell export.

Recommended options:

### Option A, tester email + password
This is the default path for the auth/trading lane. The script signs in through Supabase, mints SSR auth cookies, then calls the app endpoints with that session.

Required env:

- `SMOKE_TESTER_EMAIL`
- `SMOKE_TESTER_PASSWORD`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Option B, prebuilt auth cookie
If your CI or ops runner already has a valid tester session, you can skip the Supabase sign-in step and pass:

- `SMOKE_COOKIE_HEADER`

## Other env

- `APP_BASE_URL` optional, defaults to `https://xyz-labs-demo.vercel.app`
- `SMOKE_TRADE_AMOUNT_EUR` optional, defaults to `5`
- `SMOKE_SIDE` optional, defaults to `yes`
- `SMOKE_ACTION` optional, defaults to `buy`
- `SMOKE_INCLUDE_ADMIN_PACK` optional, defaults to `1`
- `SMOKE_VERIFY_PROFILE_RLS` optional, defaults to `0`; enable only after the profile guardrail migration is applied on runtime
- `SUPABASE_SERVICE_ROLE_KEY` optional for the admin pack when you do not want CLI fallback
- `SUPABASE_PROJECT_REF` optional override for CLI fallback, otherwise derived from `NEXT_PUBLIC_SUPABASE_URL`
- `CURL_TIMEOUT` optional, defaults to `30`

## Admin-pack provisioning notes

The admin pack provisions isolated smoke users and smoke-only markets directly through Supabase before it hits the app admin APIs.

Resolution order for the service-role secret:

1. `SUPABASE_SERVICE_ROLE_KEY` env, if present
2. `supabase projects api-keys --project-ref <ref>` CLI fallback

That means local/CI runners need either:

- `SUPABASE_SERVICE_ROLE_KEY`, or
- authenticated Supabase CLI access to the linked project

## Dependencies

The runner needs:

- `bash`
- `curl`
- `jq`
- `node`
- `supabase` CLI only if the admin pack must resolve `SUPABASE_SERVICE_ROLE_KEY` via CLI fallback

## Usage

### Production example with Vercel env + local tester secrets

```bash
cd side-project-os/prediction-market/demo
vercel pull --yes --environment=production
set -a
source .vercel/.env.production.local
set +a

export SMOKE_TESTER_EMAIL='qa-smoke@example.com'
export SMOKE_TESTER_PASSWORD='replace-from-secret-store'

./scripts/qa-smoke-alpha.sh
```

### Explicit base URL

```bash
APP_BASE_URL='https://xyz-labs-demo.vercel.app' \
SMOKE_TESTER_EMAIL='qa-smoke@example.com' \
SMOKE_TESTER_PASSWORD='replace-from-secret-store' \
NEXT_PUBLIC_SUPABASE_URL='https://<project>.supabase.co' \
NEXT_PUBLIC_SUPABASE_ANON_KEY='replace-from-secret-store' \
./scripts/qa-smoke-alpha.sh
```

### Using an existing cookie instead of credentials

```bash
APP_BASE_URL='https://xyz-labs-demo.vercel.app' \
SMOKE_COOKIE_HEADER='sb-...=...; sb-....0=...' \
./scripts/qa-smoke-alpha.sh
```

## AMM drift detection notes

Reference package:

- `/Users/dpechli/Desktop/xyz Labs/xyz_amm_package_v0/08_AMM_V0_BUILD_READY_SPEC.md`
- `/Users/dpechli/Desktop/xyz Labs/xyz_amm_package_v0/02_XYZ_Labs_AMM_Calibration_Summary.md`
- `/Users/dpechli/Desktop/xyz Labs/xyz_amm_package_v0/03_xyz_amm_reference/golden_vectors.json`

The smoke script is not just checking endpoint availability. It is also trying to catch product drift quickly.

If the script starts failing on AMM checkpoints, operators should suspect one of these first:

- quote math changed away from the expected LMSR-style model
- `depth` / `qYes` / `qNo` no longer reconcile with returned prices
- fee handling changed and wallet/history accounting no longer matches preview economics
- trade direction is moving the wrong side of the market

Quick manual smell test from the package calibration summary:

- for a standard market (`b ≈ 288.539`) starting near 50/50,
  - `€10` gross YES buy should move toward `51.70%`
  - `€50` gross YES buy should move toward `57.96%`
  - `€100` gross YES buy should move toward `64.64%`

## Notes

- The script picks the first open market returned by `/api/markets`.
- The default smoke trade is a small buy so the run stays cheap and deterministic.
- Current app behavior bootstraps the tester wallet through `/api/me`, which helps keep repeated smoke runs stable.
- Admin-pack smoke fixtures are created with unique `[SMOKE]` labels and left in settled / closed terminal states for auditability.
- Optional tolerances:
  - `DRIFT_TOLERANCE` default `0.0025`
  - `MONEY_TOLERANCE` default `0.05`
