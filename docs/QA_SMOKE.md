# QA Smoke Checks for Alpha

`./scripts/qa-smoke-alpha.sh` is the repeatable Stage 4 / production smoke check for the live alpha API path.

## What it validates

1. `GET /api/health` returns `status=ok`
2. `GET /api/markets` returns at least one market
3. Authenticated tester flow works end to end:
   - `GET /api/me`
   - `GET /api/portfolio/summary`
   - `POST /api/quotes/preview`
   - `POST /api/trades/execute`
   - `GET /api/portfolio/summary` after execution
   - `GET /api/trades/history`

The script exits non-zero on the first failure and prints concise `PASS` / `FAIL` checkpoints.

## Tester account strategy

Use a **dedicated smoke tester account**, not a personal account.

Do not hardcode secrets in the repo. Inject them at runtime from a secret manager, CI secret store, or a local shell export.

Recommended options:

### Option A, tester email + password
This is the default path. The script signs in through Supabase, mints SSR auth cookies, then calls the app endpoints with that session.

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
- `CURL_TIMEOUT` optional, defaults to `30`

## Dependencies

The runner needs:

- `bash`
- `curl`
- `jq`
- `node`

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

## Notes

- The script picks the first open market returned by `/api/markets`.
- The default smoke trade is a small buy so the run stays cheap and deterministic.
- Current app behavior bootstraps the tester wallet through `/api/me`, which helps keep repeated smoke runs stable.
