#!/usr/bin/env bash
set -Eeuo pipefail

BASE_URL="${APP_BASE_URL:-https://xyz-labs-demo.vercel.app}"
BASE_URL="${BASE_URL%/}"
CURL_TIMEOUT="${CURL_TIMEOUT:-30}"
SMOKE_TRADE_AMOUNT_EUR="${SMOKE_TRADE_AMOUNT_EUR:-5}"
SMOKE_SIDE="${SMOKE_SIDE:-yes}"
SMOKE_ACTION="${SMOKE_ACTION:-buy}"

TMP_FILES=()
RESPONSE_FILE=""
RESPONSE_STATUS=""

cleanup() {
  local file
  for file in "${TMP_FILES[@]:-}"; do
    [ -n "$file" ] && [ -e "$file" ] && rm -f "$file"
  done
}
trap cleanup EXIT

pass() {
  printf 'PASS %s\n' "$1"
}

fail() {
  printf 'FAIL %s\n' "$1" >&2
  exit 1
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "missing dependency: $1"
}

new_tmp() {
  local file
  file="$(mktemp)"
  TMP_FILES+=("$file")
  printf '%s' "$file"
}

response_error() {
  if [ -n "$RESPONSE_FILE" ] && [ -s "$RESPONSE_FILE" ]; then
    jq -r '.error // .detail // .message // .msg // empty' "$RESPONSE_FILE" 2>/dev/null || true
  fi
}

request_json() {
  local method=$1
  local url=$2
  local body=${3-}
  local cookie_header=${4-}
  local -a curl_args

  RESPONSE_FILE="$(new_tmp)"
  curl_args=(
    -sS
    -X "$method"
    "$url"
    -o "$RESPONSE_FILE"
    -w '%{http_code}'
    --max-time "$CURL_TIMEOUT"
    -H 'accept: application/json'
  )

  if [ -n "$body" ]; then
    curl_args+=( -H 'content-type: application/json' --data "$body" )
  fi

  if [ -n "$cookie_header" ]; then
    curl_args+=( -H "cookie: $cookie_header" )
  fi

  if ! RESPONSE_STATUS="$(curl "${curl_args[@]}")"; then
    fail "$method $url request failed"
  fi
}

expect_status() {
  local wanted=$1
  local label=$2
  local detail

  if [ "$RESPONSE_STATUS" != "$wanted" ]; then
    detail="$(response_error)"
    fail "$label (http=$RESPONSE_STATUS${detail:+, detail=$detail})"
  fi
}

expect_jq() {
  local label expr detail jq_arg_count
  local -a jq_args

  [ "$#" -ge 2 ] || fail 'expect_jq requires at least an expression and label'

  label="${!#}"
  expr="${@: -2:1}"
  jq_arg_count=$(($# - 2))
  jq_args=()

  if [ "$jq_arg_count" -gt 0 ]; then
    jq_args=("${@:1:$jq_arg_count}")
    if jq -e "${jq_args[@]}" "$expr" "$RESPONSE_FILE" >/dev/null 2>&1; then
      return 0
    fi
  else
    if jq -e "$expr" "$RESPONSE_FILE" >/dev/null 2>&1; then
      return 0
    fi
  fi

  detail="$(response_error)"
  fail "$label (http=$RESPONSE_STATUS${detail:+, detail=$detail})"
}

require_auth_inputs() {
  if [ -n "${SMOKE_COOKIE_HEADER:-}" ]; then
    return 0
  fi

  [ -n "${SMOKE_TESTER_EMAIL:-}" ] || fail 'set SMOKE_TESTER_EMAIL or SMOKE_COOKIE_HEADER for authenticated smoke checks'
  [ -n "${SMOKE_TESTER_PASSWORD:-}" ] || fail 'set SMOKE_TESTER_PASSWORD or SMOKE_COOKIE_HEADER for authenticated smoke checks'
  [ -n "${NEXT_PUBLIC_SUPABASE_URL:-}" ] || fail 'set NEXT_PUBLIC_SUPABASE_URL when using tester credentials'
  [ -n "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" ] || fail 'set NEXT_PUBLIC_SUPABASE_ANON_KEY when using tester credentials'
}

build_auth_cookie() {
  if [ -n "${SMOKE_COOKIE_HEADER:-}" ]; then
    printf '%s' "$SMOKE_COOKIE_HEADER"
    return 0
  fi

  node <<'NODE'
const { createServerClient } = require('@supabase/ssr');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const email = process.env.SMOKE_TESTER_EMAIL;
const password = process.env.SMOKE_TESTER_PASSWORD;

const cookieJar = new Map();

const supabase = createServerClient(url, anonKey, {
  cookies: {
    getAll() {
      return Array.from(cookieJar.entries()).map(([name, value]) => ({ name, value }));
    },
    setAll(cookiesToSet) {
      for (const cookie of cookiesToSet) {
        cookieJar.set(cookie.name, cookie.value);
      }
    }
  }
});

(async () => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error(error.message || 'signInWithPassword failed');
    process.exit(1);
  }

  const cookieHeader = Array.from(cookieJar.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');

  if (!cookieHeader) {
    console.error('supabase auth produced no cookies');
    process.exit(1);
  }

  process.stdout.write(cookieHeader);
})();
NODE
}

need_cmd curl
need_cmd jq
need_cmd node

case "$SMOKE_SIDE" in
  yes|no) ;;
  *) fail 'SMOKE_SIDE must be yes or no' ;;
esac

case "$SMOKE_ACTION" in
  buy|sell) ;;
  *) fail 'SMOKE_ACTION must be buy or sell' ;;
esac

request_json GET "$BASE_URL/api/health"
expect_status 200 'health endpoint failed'
expect_jq '.status == "ok"' 'health endpoint did not return status=ok'
pass "/api/health ok"

request_json GET "$BASE_URL/api/markets"
expect_status 200 'markets endpoint failed'
expect_jq '(.markets | type) == "array" and (.markets | length) > 0' 'markets endpoint returned an empty list'

MARKET_ID="$(jq -r '([.markets[] | select(.status == "open")] | .[0].id) // .markets[0].id // empty' "$RESPONSE_FILE")"
MARKET_SLUG="$(jq -r '([.markets[] | select(.status == "open")] | .[0].slug) // .markets[0].slug // empty' "$RESPONSE_FILE")"
MARKET_COUNT="$(jq -r '.markets | length' "$RESPONSE_FILE")"

[ -n "$MARKET_ID" ] || fail 'could not resolve a market id from /api/markets'
pass "/api/markets count=${MARKET_COUNT} market=${MARKET_SLUG:-$MARKET_ID}"

require_auth_inputs
AUTH_COOKIE="$(build_auth_cookie)" || fail 'could not mint auth cookies for tester account'
[ -n "$AUTH_COOKIE" ] || fail 'auth cookie header is empty'

request_json GET "$BASE_URL/api/me" '' "$AUTH_COOKIE"
expect_status 200 'authenticated /api/me failed'
expect_jq '.user.id != null and .user.wallet != null' 'authenticated /api/me did not return a bootstrapped tester user'
USER_ID="$(jq -r '.user.id' "$RESPONSE_FILE")"
ME_WALLET_BEFORE="$(jq -r '.user.wallet.available_balance // 0' "$RESPONSE_FILE")"
pass "/api/me user=${USER_ID} wallet=${ME_WALLET_BEFORE}"

request_json GET "$BASE_URL/api/portfolio/summary" '' "$AUTH_COOKIE"
expect_status 200 'portfolio summary failed before trade'
expect_jq '.wallet != null and (.wallet.availableBalance | numbers)' 'portfolio summary missing wallet payload'
PORTFOLIO_BEFORE="$(jq -r '.wallet.availableBalance' "$RESPONSE_FILE")"
pass "/api/portfolio/summary pre-trade wallet=${PORTFOLIO_BEFORE}"

QUOTE_BODY="$(jq -cn \
  --arg marketId "$MARKET_ID" \
  --arg side "$SMOKE_SIDE" \
  --arg action "$SMOKE_ACTION" \
  --argjson amountEur "$SMOKE_TRADE_AMOUNT_EUR" \
  '{marketId: $marketId, side: $side, action: $action, amountEur: $amountEur}'
)"

request_json POST "$BASE_URL/api/quotes/preview" "$QUOTE_BODY" "$AUTH_COOKIE"
expect_status 200 'quote preview failed'
expect_jq '.quoteHash != null and .expiresAt != null and (.quote.shareDelta | numbers) > 0' 'quote preview did not return a usable quote'
QUOTE_HASH="$(jq -r '.quoteHash' "$RESPONSE_FILE")"
QUOTE_EXPIRES_AT="$(jq -r '.expiresAt' "$RESPONSE_FILE")"
QUOTE_SHARE_DELTA="$(jq -r '.quote.shareDelta' "$RESPONSE_FILE")"
QUOTE_AVG_PRICE="$(jq -r '.quote.averagePrice' "$RESPONSE_FILE")"
pass "/api/quotes/preview shares=${QUOTE_SHARE_DELTA} avg=${QUOTE_AVG_PRICE}"

EXECUTE_BODY="$(jq -cn \
  --arg marketId "$MARKET_ID" \
  --arg side "$SMOKE_SIDE" \
  --arg action "$SMOKE_ACTION" \
  --arg quoteHash "$QUOTE_HASH" \
  --arg quoteExpiresAt "$QUOTE_EXPIRES_AT" \
  --argjson amountEur "$SMOKE_TRADE_AMOUNT_EUR" \
  '{marketId: $marketId, side: $side, action: $action, amountEur: $amountEur, quoteHash: $quoteHash, quoteExpiresAt: $quoteExpiresAt}'
)"

request_json POST "$BASE_URL/api/trades/execute" "$EXECUTE_BODY" "$AUTH_COOKIE"
expect_status 200 'trade execute failed'
expect_jq '.status == "executed"' 'trade execute did not return executed status'
pass "/api/trades/execute status=executed"

request_json GET "$BASE_URL/api/portfolio/summary" '' "$AUTH_COOKIE"
expect_status 200 'portfolio summary failed after trade'
expect_jq --arg marketId "$MARKET_ID" '.positions | map(select(.marketId == $marketId)) | length > 0' 'portfolio summary did not include the traded market'
PORTFOLIO_AFTER="$(jq -r '.wallet.availableBalance' "$RESPONSE_FILE")"
pass "/api/portfolio/summary post-trade wallet=${PORTFOLIO_AFTER}"

request_json GET "$BASE_URL/api/trades/history?limit=10" '' "$AUTH_COOKIE"
expect_status 200 'trade history failed'
expect_jq --arg marketId "$MARKET_ID" --arg side "$SMOKE_SIDE" --arg action "$SMOKE_ACTION" --argjson amount "$SMOKE_TRADE_AMOUNT_EUR" '
  (.count | numbers) > 0 and
  ([.trades[] | select(.marketId == $marketId and .side == $side and .action == $action and (.grossAmount | numbers) >= ($amount - 0.01))] | length) > 0
' 'trade history did not include the executed smoke trade'
HISTORY_COUNT="$(jq -r '.count' "$RESPONSE_FILE")"
pass "/api/trades/history count=${HISTORY_COUNT}"

pass "qa smoke complete base=${BASE_URL} market=${MARKET_SLUG:-$MARKET_ID}"
