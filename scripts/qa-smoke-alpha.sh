#!/usr/bin/env bash
set -Eeuo pipefail

BASE_URL="${APP_BASE_URL:-https://xyz-labs-demo.vercel.app}"
BASE_URL="${BASE_URL%/}"
CURL_TIMEOUT="${CURL_TIMEOUT:-30}"
SMOKE_TRADE_AMOUNT_EUR="${SMOKE_TRADE_AMOUNT_EUR:-5}"
SMOKE_SIDE="${SMOKE_SIDE:-yes}"
SMOKE_ACTION="${SMOKE_ACTION:-buy}"
SMOKE_INCLUDE_ADMIN_PACK="${SMOKE_INCLUDE_ADMIN_PACK:-1}"
DRIFT_TOLERANCE="${DRIFT_TOLERANCE:-0.0025}"
MONEY_TOLERANCE="${MONEY_TOLERANCE:-0.05}"

TMP_FILES=()
RESPONSE_FILE=""
RESPONSE_STATUS=""

cleanup() {
  local file
  for file in "${TMP_FILES[@]:-}"; do
    if [ -n "$file" ] && [ -e "$file" ]; then
      rm -f "$file" || true
    fi
  done

  return 0
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

# AMM drift checks are tied to xyz_amm_package_v0 assumptions:
# - binary complementary YES/NO prices
# - LMSR-style price derivation from qYes/qNo/depth
# - monotonic price movement in trade direction
# - average fill between pre and post side price
# - fee applied on gross cash, then reflected in wallet/history
expect_amm_quote_consistency() {
  local summary

  if ! summary="$(node - "$1" "$2" "$3" "$4" 2>&1 <<'NODE'
const fs = require('fs');

const [responsePath, side, action, tolArg] = process.argv.slice(2);
const tol = Number(tolArg);
const body = JSON.parse(fs.readFileSync(responsePath, 'utf8'));

function fail(message) {
  console.error(message);
  process.exit(1);
}

function approx(a, b, tolerance) {
  return Math.abs(a - b) <= tolerance;
}

function sigmoid(x) {
  return x >= 0 ? 1 / (1 + Math.exp(-x)) : Math.exp(x) / (1 + Math.exp(x));
}

const depth = Number(body?.market?.depth);
const qYes = Number(body?.state?.qYes);
const qNo = Number(body?.state?.qNo);
const yesPrice = Number(body?.state?.yesPrice);
const noPrice = Number(body?.state?.noPrice);
const shareDelta = Number(body?.quote?.shareDelta);
const avg = Number(body?.quote?.averagePrice);
const amount = Number(body?.quote?.amountEur);
const fee = Number(body?.quote?.feeAmountEur);
const total = Number(body?.quote?.totalAmountEur);
const postYes = Number(body?.quote?.postYesPrice);
const postNo = Number(body?.quote?.postNoPrice);
const impact = Number(body?.quote?.impact);
const feeBps = Number(body?.market?.feeBps);

if (![depth, qYes, qNo, yesPrice, noPrice, shareDelta, avg, amount, fee, total, postYes, postNo, impact, feeBps].every(Number.isFinite)) {
  fail('quote payload missing numeric AMM fields');
}
if (!(depth > 0) || !(shareDelta > 0)) {
  fail('depth/shareDelta must be positive');
}

const expectedYes = sigmoid((qYes - qNo) / depth);
if (!approx(yesPrice, expectedYes, tol)) {
  fail(`state yesPrice drifted from LMSR expectation (${yesPrice} vs ${expectedYes})`);
}
if (!approx(yesPrice + noPrice, 1, tol)) {
  fail(`state prices no longer complement to 1 (${yesPrice + noPrice})`);
}

let qYesAfter = qYes;
let qNoAfter = qNo;
if (side === 'yes') qYesAfter += action === 'buy' ? shareDelta : -shareDelta;
if (side === 'no') qNoAfter += action === 'buy' ? shareDelta : -shareDelta;
if (qYesAfter < 0 || qNoAfter < 0) {
  fail('trade would push q state negative');
}

const expectedPostYes = sigmoid((qYesAfter - qNoAfter) / depth);
const expectedPostNo = 1 - expectedPostYes;
if (!approx(postYes, expectedPostYes, tol)) {
  fail(`postYesPrice drifted from LMSR expectation (${postYes} vs ${expectedPostYes})`);
}
if (!approx(postYes + postNo, 1, tol)) {
  fail(`post-trade prices no longer complement to 1 (${postYes + postNo})`);
}
if (!approx(postNo, expectedPostNo, tol)) {
  fail(`postNoPrice drifted from LMSR expectation (${postNo} vs ${expectedPostNo})`);
}

if (side === 'yes' && action === 'buy' && !(postYes > yesPrice)) fail('buy YES no longer increases pYes');
if (side === 'yes' && action === 'sell' && !(postYes < yesPrice)) fail('sell YES no longer decreases pYes');
if (side === 'no' && action === 'buy' && !(postYes < yesPrice)) fail('buy NO no longer decreases pYes');
if (side === 'no' && action === 'sell' && !(postYes > yesPrice)) fail('sell NO no longer increases pYes');

const preSide = side === 'yes' ? yesPrice : noPrice;
const postSide = side === 'yes' ? postYes : postNo;
const lower = Math.min(preSide, postSide) - tol;
const upper = Math.max(preSide, postSide) + tol;
if (avg < lower || avg > upper) {
  fail(`avg fill left the expected side-price band (${avg} not in ${lower}..${upper})`);
}

const expectedFee = Math.round((amount * feeBps / 10000 + Number.EPSILON) * 100) / 100;
const expectedTotal = action === 'buy'
  ? Math.round((amount + expectedFee + Number.EPSILON) * 100) / 100
  : Math.round((Math.max(amount - expectedFee, 0) + Number.EPSILON) * 100) / 100;
if (!approx(fee, expectedFee, 0.01)) {
  fail(`fee drift detected (${fee} vs ${expectedFee})`);
}
if (!approx(total, expectedTotal, 0.01)) {
  fail(`total amount drift detected (${total} vs ${expectedTotal})`);
}
if (!approx(impact, Math.abs(postYes - yesPrice), tol)) {
  fail(`impact field drift detected (${impact} vs ${Math.abs(postYes - yesPrice)})`);
}

process.stdout.write(`pYes=${yesPrice.toFixed(4)}->${postYes.toFixed(4)} avg=${avg.toFixed(4)} impact=${impact.toFixed(4)}`);
NODE
)"; then
    fail "AMM quote drift detected (${summary})"
  fi

  printf '%s' "$summary"
}

expect_execute_quote_match() {
  local summary

  if ! summary="$(node - "$1" "$2" "$3" "$4" "$5" "$6" 2>&1 <<'NODE'
const fs = require('fs');

const [responsePath, shareArg, avgArg, grossArg, feeArg, totalArg] = process.argv.slice(2);
const body = JSON.parse(fs.readFileSync(responsePath, 'utf8'));

const expected = {
  shareDelta: Number(shareArg),
  averagePrice: Number(avgArg),
  amountEur: Number(grossArg),
  feeAmountEur: Number(feeArg),
  totalAmountEur: Number(totalArg)
};
const actual = body?.quote ?? {};

function fail(message) {
  console.error(message);
  process.exit(1);
}

function approx(a, b, tolerance) {
  return Math.abs(a - b) <= tolerance;
}

if (!approx(Number(actual.shareDelta), expected.shareDelta, 0.000001)) fail('execute shareDelta no longer matches preview');
if (!approx(Number(actual.averagePrice), expected.averagePrice, 0.000001)) fail('execute avg price no longer matches preview');
if (!approx(Number(actual.amountEur), expected.amountEur, 0.01)) fail('execute gross amount no longer matches preview');
if (!approx(Number(actual.feeAmountEur), expected.feeAmountEur, 0.01)) fail('execute fee no longer matches preview');
if (!approx(Number(actual.totalAmountEur), expected.totalAmountEur, 0.01)) fail('execute total no longer matches preview');

process.stdout.write(`gross=${Number(actual.amountEur).toFixed(2)} fee=${Number(actual.feeAmountEur).toFixed(2)} total=${Number(actual.totalAmountEur).toFixed(2)}`);
NODE
)"; then
    fail "execute quote drift detected (${summary})"
  fi

  printf '%s' "$summary"
}

expect_wallet_delta_consistency() {
  local summary

  if ! summary="$(node - "$1" "$2" "$3" "$4" "$5" 2>&1 <<'NODE'
const [beforeArg, afterArg, action, totalArg, tolArg] = process.argv.slice(2);
const before = Number(beforeArg);
const after = Number(afterArg);
const total = Number(totalArg);
const tol = Number(tolArg);

function fail(message) {
  console.error(message);
  process.exit(1);
}

function approx(a, b, tolerance) {
  return Math.abs(a - b) <= tolerance;
}

const observedDelta = +(after - before).toFixed(2);
const expectedDelta = +(action === 'buy' ? -total : total).toFixed(2);
if (!approx(observedDelta, expectedDelta, tol)) {
  fail(`wallet delta drift detected (${observedDelta} vs ${expectedDelta})`);
}

process.stdout.write(`walletDelta=${observedDelta.toFixed(2)}`);
NODE
)"; then
    fail "portfolio accounting drift detected (${summary})"
  fi

  printf '%s' "$summary"
}

expect_history_trade_consistency() {
  local summary

  if ! summary="$(node - "$1" "$2" "$3" "$4" "$5" "$6" "$7" "$8" 2>&1 <<'NODE'
const fs = require('fs');

const [responsePath, marketId, side, action, shareArg, avgArg, grossArg, feeArg] = process.argv.slice(2);
const body = JSON.parse(fs.readFileSync(responsePath, 'utf8'));
const trades = Array.isArray(body?.trades) ? body.trades : [];

function fail(message) {
  console.error(message);
  process.exit(1);
}

function approx(a, b, tolerance) {
  return Math.abs(a - b) <= tolerance;
}

const match = trades.find((trade) => (
  trade.marketId === marketId &&
  trade.side === side &&
  trade.action === action &&
  approx(Number(trade.shareDelta), Number(shareArg), 0.000001) &&
  approx(Number(trade.avgPrice), Number(avgArg), 0.000001) &&
  approx(Number(trade.grossAmount), Number(grossArg), 0.01) &&
  approx(Number(trade.feeAmount), Number(feeArg), 0.01)
));

if (!match) {
  fail('history payload missing a trade that matches preview/execute economics');
}

process.stdout.write(`historyTrade=${match.id}`);
NODE
)"; then
    fail "trade history drift detected (${summary})"
  fi

  printf '%s' "$summary"
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
expect_jq '.readiness.supabase.urlConfigured == true and .readiness.supabase.anonKeyConfigured == true' 'health readiness did not confirm Supabase client env'
expect_jq '.readiness.telemetry.sentry.envConfigured == true and .readiness.telemetry.sentry.sdkConfigured == true and .readiness.telemetry.posthog.envConfigured == true and .readiness.telemetry.posthog.sdkConfigured == true' 'health readiness did not confirm telemetry wiring'
pass "/api/health ok + telemetry ready"

request_json GET "$BASE_URL/api/markets"
expect_status 200 'markets endpoint failed'
expect_jq '(.markets | type) == "array" and (.markets | length) > 0' 'markets endpoint returned an empty list'

MARKET_ID="$(jq -r '([.markets[] | select(.status == "open")] | .[0].id) // .markets[0].id // empty' "$RESPONSE_FILE")"
MARKET_SLUG="$(jq -r '([.markets[] | select(.status == "open")] | .[0].slug) // .markets[0].slug // empty' "$RESPONSE_FILE")"
MARKET_COUNT="$(jq -r '.markets | length' "$RESPONSE_FILE")"

[ -n "$MARKET_ID" ] || fail 'could not resolve a market id from /api/markets'
pass "/api/markets count=${MARKET_COUNT} market=${MARKET_SLUG:-$MARKET_ID}"

request_json GET "$BASE_URL/api/markets/${MARKET_SLUG}"
expect_status 200 'market detail endpoint failed for selected smoke market'
expect_jq --arg marketId "$MARKET_ID" --arg marketSlug "$MARKET_SLUG" '.market.id == $marketId and .market.slug == $marketSlug and .state != null' 'market detail payload missing market/state for selected smoke market'
pass "/api/markets/[slug] detail available for smoke market"

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
QUOTE_GROSS_AMOUNT="$(jq -r '.quote.amountEur' "$RESPONSE_FILE")"
QUOTE_FEE_AMOUNT="$(jq -r '.quote.feeAmountEur' "$RESPONSE_FILE")"
QUOTE_TOTAL_AMOUNT="$(jq -r '.quote.totalAmountEur' "$RESPONSE_FILE")"
QUOTE_PRE_VOLUME="$(jq -r '.state.volumeTotal // 0' "$RESPONSE_FILE")"
AMM_QUOTE_SUMMARY="$(expect_amm_quote_consistency "$RESPONSE_FILE" "$SMOKE_SIDE" "$SMOKE_ACTION" "$DRIFT_TOLERANCE")"
pass "/api/quotes/preview shares=${QUOTE_SHARE_DELTA} avg=${QUOTE_AVG_PRICE} ${AMM_QUOTE_SUMMARY}"

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
EXECUTE_MATCH_SUMMARY="$(expect_execute_quote_match "$RESPONSE_FILE" "$QUOTE_SHARE_DELTA" "$QUOTE_AVG_PRICE" "$QUOTE_GROSS_AMOUNT" "$QUOTE_FEE_AMOUNT" "$QUOTE_TOTAL_AMOUNT")"
pass "/api/trades/execute status=executed ${EXECUTE_MATCH_SUMMARY}"

request_json GET "$BASE_URL/api/markets/${MARKET_SLUG}"
expect_status 200 'market detail endpoint failed after execute'
expect_jq --argjson preVol "$QUOTE_PRE_VOLUME" '.state.last_trade_at != null and (.state.volume_total | numbers) >= $preVol' 'market detail state did not reflect executed trade'
pass "/api/markets/[slug] reflects executed trade state"

request_json GET "$BASE_URL/api/portfolio/summary" '' "$AUTH_COOKIE"
expect_status 200 'portfolio summary failed after trade'
expect_jq --arg marketId "$MARKET_ID" '.positions | map(select(.marketId == $marketId)) | length > 0' 'portfolio summary did not include the traded market'
PORTFOLIO_AFTER="$(jq -r '.wallet.availableBalance' "$RESPONSE_FILE")"
WALLET_DELTA_SUMMARY="$(expect_wallet_delta_consistency "$PORTFOLIO_BEFORE" "$PORTFOLIO_AFTER" "$SMOKE_ACTION" "$QUOTE_TOTAL_AMOUNT" "$MONEY_TOLERANCE")"
pass "/api/portfolio/summary post-trade wallet=${PORTFOLIO_AFTER} ${WALLET_DELTA_SUMMARY}"

request_json GET "$BASE_URL/api/trades/history?limit=10" '' "$AUTH_COOKIE"
expect_status 200 'trade history failed'
expect_jq --arg marketId "$MARKET_ID" --arg side "$SMOKE_SIDE" --arg action "$SMOKE_ACTION" '
  (.count | numbers) > 0 and
  ([.trades[] | select(.marketId == $marketId and .side == $side and .action == $action)] | length) > 0
' 'trade history did not include the executed smoke trade'
HISTORY_COUNT="$(jq -r '.count' "$RESPONSE_FILE")"
HISTORY_MATCH_SUMMARY="$(expect_history_trade_consistency "$RESPONSE_FILE" "$MARKET_ID" "$SMOKE_SIDE" "$SMOKE_ACTION" "$QUOTE_SHARE_DELTA" "$QUOTE_AVG_PRICE" "$QUOTE_GROSS_AMOUNT" "$QUOTE_FEE_AMOUNT")"
pass "/api/trades/history count=${HISTORY_COUNT} ${HISTORY_MATCH_SUMMARY}"

if [ "${SMOKE_INCLUDE_ADMIN_PACK}" != "0" ]; then
  node ./scripts/qa-smoke-admin-pack.mjs
fi

pass "qa smoke complete base=${BASE_URL} market=${MARKET_SLUG:-$MARKET_ID}"
