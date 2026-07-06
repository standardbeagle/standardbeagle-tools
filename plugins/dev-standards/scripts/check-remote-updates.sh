#!/bin/bash
#
# check-remote-updates.sh — dev-standards plugin
#
# Looks for remote updates on the current branch and the base branch, then
# nudges the agent to merge them at the next stopping point. Wired to three
# Claude Code hook events:
#
#   SessionStart  — always fetch, report drift as session context
#   PostToolUse   — throttled fetch (periodic), report only when behind
#   Stop          — throttled fetch, warn the user when behind (stopping point)
#
# Safe by design: silent no-op outside a git repo, no upstream, or when offline.
# Opt out entirely with DEV_STANDARDS_REMOTE_CHECK=0.
# Tune the throttle with DEV_STANDARDS_REMOTE_CHECK_INTERVAL (seconds, default 300).

set -uo pipefail

EVENT="${1:-PostToolUse}"

# Global opt-out.
[ "${DEV_STANDARDS_REMOTE_CHECK:-1}" = "0" ] && exit 0

INTERVAL="${DEV_STANDARDS_REMOTE_CHECK_INTERVAL:-300}"

# The hook payload arrives on stdin as JSON; prefer its cwd, fall back to PWD.
STDIN="$(cat 2>/dev/null || true)"
DIR="$PWD"
if command -v jq >/dev/null 2>&1 && [ -n "$STDIN" ]; then
  CWD="$(printf '%s' "$STDIN" | jq -r '.cwd // empty' 2>/dev/null)"
  [ -n "$CWD" ] && DIR="$CWD"
fi

# Must be inside a git work tree, else stay silent.
ROOT="$(git -C "$DIR" rev-parse --show-toplevel 2>/dev/null)" || exit 0
[ -z "$ROOT" ] && exit 0

STAMP="$ROOT/.git/dev-standards-remote-check"

# Throttle: SessionStart always fetches; other events honor the interval.
FORCE=0
[ "$EVENT" = "SessionStart" ] && FORCE=1

now_epoch() { date +%s 2>/dev/null || echo 0; }

if [ "$FORCE" -eq 0 ] && [ -f "$STAMP" ]; then
  LAST="$(cat "$STAMP" 2>/dev/null || echo 0)"
  NOW="$(now_epoch)"
  case "$LAST" in *[!0-9]*|'') LAST=0 ;; esac
  if [ "$NOW" -ne 0 ] && [ $((NOW - LAST)) -lt "$INTERVAL" ]; then
    exit 0
  fi
fi

# Record the attempt up front so a slow/failing fetch still throttles the next call.
now_epoch > "$STAMP" 2>/dev/null || true

# Fetch quietly, bounded, offline-tolerant. Don't let failure abort the hook.
if command -v timeout >/dev/null 2>&1; then
  timeout 15 git -C "$ROOT" fetch --quiet --all --prune >/dev/null 2>&1 || true
else
  git -C "$ROOT" fetch --quiet --all --prune >/dev/null 2>&1 || true
fi

# --- Current branch drift vs its upstream ---
CUR_BRANCH="$(git -C "$ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null)"
CUR_MSG=""
if [ -n "$CUR_BRANCH" ] && [ "$CUR_BRANCH" != "HEAD" ]; then
  UPSTREAM="$(git -C "$ROOT" rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' 2>/dev/null || true)"
  if [ -n "$UPSTREAM" ]; then
    BEHIND="$(git -C "$ROOT" rev-list --count "HEAD..$UPSTREAM" 2>/dev/null || echo 0)"
    if [ "${BEHIND:-0}" -gt 0 ] 2>/dev/null; then
      CUR_MSG="current branch \`$CUR_BRANCH\` is $BEHIND commit(s) behind \`$UPSTREAM\`"
    fi
  fi
fi

# --- Base branch new commits not yet in your work ---
# Detect the base from origin/HEAD, fall back to main then master.
BASE_MSG=""
BASE_REF="$(git -C "$ROOT" symbolic-ref --quiet refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/@@')"
if [ -z "$BASE_REF" ]; then
  for cand in origin/main origin/master; do
    if git -C "$ROOT" rev-parse --verify --quiet "$cand" >/dev/null 2>&1; then
      BASE_REF="$cand"; break
    fi
  done
fi
if [ -n "$BASE_REF" ] && [ "$BASE_REF" != "origin/$CUR_BRANCH" ]; then
  BASE_NEW="$(git -C "$ROOT" rev-list --count "HEAD..$BASE_REF" 2>/dev/null || echo 0)"
  if [ "${BASE_NEW:-0}" -gt 0 ] 2>/dev/null; then
    BASE_MSG="base \`$BASE_REF\` has $BASE_NEW new commit(s) not in your branch"
  fi
fi

# Nothing to report → stay silent.
[ -z "$CUR_MSG" ] && [ -z "$BASE_MSG" ] && exit 0

DRIFT="$CUR_MSG"
if [ -n "$BASE_MSG" ]; then
  [ -n "$DRIFT" ] && DRIFT="$DRIFT; $BASE_MSG" || DRIFT="$BASE_MSG"
fi

NUDGE="Remote updates available: $DRIFT. Always be merging: at your next natural stopping point (before starting new work, after a green commit), pull/merge remote changes to avoid drift and painful conflicts."

emit_context() {
  local ev="$1" msg="$2"
  if command -v jq >/dev/null 2>&1; then
    jq -n --arg ev "$ev" --arg ctx "$msg" \
      '{hookSpecificOutput:{hookEventName:$ev,additionalContext:$ctx}}'
  else
    printf '%s\n' "$msg"
  fi
}

case "$EVENT" in
  SessionStart|PostToolUse)
    emit_context "$EVENT" "$NUDGE"
    ;;
  Stop)
    if command -v jq >/dev/null 2>&1; then
      jq -n --arg m "$NUDGE" '{systemMessage:$m}'
    else
      printf '%s\n' "$NUDGE" >&2
    fi
    ;;
  *)
    emit_context "PostToolUse" "$NUDGE"
    ;;
esac

exit 0
