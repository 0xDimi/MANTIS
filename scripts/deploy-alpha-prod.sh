#!/usr/bin/env bash
set -Eeuo pipefail

fail() {
  printf 'FAIL %s\n' "$1" >&2
  exit 1
}

pass() {
  printf 'PASS %s\n' "$1"
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "missing dependency: $1"
}

need_cmd git
need_cmd npm
need_cmd node
need_cmd vercel

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git -C "$SCRIPT_DIR/.." rev-parse --show-toplevel 2>/dev/null)" || fail 'could not resolve repo root'
cd "$REPO_ROOT"

bash "$SCRIPT_DIR/preflight-alpha-deploy.sh"

LOCAL_SHA="$(git rev-parse HEAD)"
git push origin HEAD:alpha
git fetch --quiet origin alpha || fail 'git fetch origin alpha failed after push'

REMOTE_SHA="$(git rev-parse origin/alpha)"
[ "$LOCAL_SHA" = "$REMOTE_SHA" ] || fail "origin/alpha (${REMOTE_SHA}) does not match local HEAD (${LOCAL_SHA}) after push"
pass "remote alpha matches local HEAD at ${REMOTE_SHA}"

WORKTREE_DIR="$(mktemp -d "${TMPDIR:-/tmp}/mantis-alpha-deploy.XXXXXX")"

cleanup() {
  git worktree remove --force "$WORKTREE_DIR" >/dev/null 2>&1 || rm -rf "$WORKTREE_DIR"
}
trap cleanup EXIT

git worktree add --quiet --detach "$WORKTREE_DIR" "$REMOTE_SHA"

(
  cd "$WORKTREE_DIR"
  npm ci
  npm run typecheck
  npm run test:week3
  npm run test:week5
  npm run test:week6
  npm run test:week7
  node --experimental-strip-types scripts/verify-market-card-assets.mjs --require-git-tracked
  npm run build
  vercel deploy --prod --yes
)

pass "production deploy completed from clean worktree at ${REMOTE_SHA}"
