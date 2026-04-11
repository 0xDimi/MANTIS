# Alpha API Workflow (Backend Wiring)

## 1) Market board
- `GET /api/markets`
- Returns market list + state snapshot (prices, volume, participants)

## 2) Market detail
- `GET /api/markets/[slug]`
- Returns full market metadata + state for contract page/ticket

## 3) Quote preview
- `POST /api/quotes/preview`
- Body:
  - `marketId` or `marketSlug`
  - `side` (`yes` | `no`)
  - `action` (`buy` | `sell`)
  - `amountEur`
- Returns:
  - computed quote (`averagePrice`, `shareDelta`, `fee`, `postYesPrice`, etc.)
  - `quoteHash`
  - `expiresAt`

## 4) Execute trade
- `POST /api/trades/execute`
- Body:
  - `marketId`
  - `side`
  - `action`
  - `amountEur`
  - `quoteHash`
  - `quoteExpiresAt`
- Server behavior:
  - re-prices quote from latest state
  - validates hash and expiry
  - executes atomic wallet/position/trade/ledger update via `execute_alpha_trade` SQL function

## 5) Portfolio and history
- `GET /api/portfolio/summary`
  - auth required
  - returns wallet balances, per-market position stats, and aggregated P/L
- `GET /api/trades/history?limit=50`
  - auth required
  - returns latest trades with market metadata

## Notes
- Requires Supabase env wiring (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- `GET /api/me` bootstraps profile + €1,000 paper wallet if missing
