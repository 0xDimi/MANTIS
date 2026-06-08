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

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || fail 'not inside a git repository'
cd "$REPO_ROOT"

BRANCH="$(git branch --show-current)"
[ "$BRANCH" = "alpha" ] || fail "expected alpha branch, got ${BRANCH:-detached HEAD}"

git fetch --quiet origin alpha || fail 'git fetch origin alpha failed'

git diff --quiet || fail 'working tree has unstaged changes'
git diff --cached --quiet || fail 'working tree has staged but uncommitted changes'
[ -z "$(git ls-files --others --exclude-standard)" ] || fail 'working tree has untracked files'

read -r BEHIND AHEAD < <(git rev-list --left-right --count origin/alpha...HEAD)
[ "$BEHIND" = "0" ] || fail "local HEAD is behind origin/alpha by ${BEHIND} commit(s)"
pass "git state is clean on alpha (ahead ${AHEAD}, behind ${BEHIND})"

npm run typecheck
npm run test:week3
npm run test:week5
npm run test:week6
npm run test:week7
node --experimental-strip-types scripts/verify-market-card-assets.mjs --require-git-tracked
npm run build

pass 'alpha deploy preflight passed'
