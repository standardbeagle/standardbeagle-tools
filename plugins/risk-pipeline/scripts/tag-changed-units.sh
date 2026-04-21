#!/usr/bin/env bash
# risk-pipeline: PostToolUse hook — enqueue changed files for @risk re-tagging.
#
# Fires after Write|Edit|MultiEdit tool calls. This script is the fast,
# non-blocking half of the tagger pipeline:
#
#   1. Parse hook JSON on stdin → extract tool name + file path.
#   2. Gate on daily tag cap (telemetry count for today vs. cap).
#   3. Acquire a per-file lock; reclaim stale (>60s) locks.
#   4. Body-hash whitespace pre-check: skip when normalized body is unchanged.
#   5. Append an "enqueue" record to .risk-pipeline/queue.jsonl +
#      a telemetry line to .risk-pipeline/telemetry.jsonl.
#
# The actual tagging (LCI + Haiku/Sonnet + Edit) is an LLM-level skill
# (risk-tag-unit) that shell cannot invoke directly. Claude drains this
# queue on the next turn, or the user runs /risk-pipeline:tag-sweep.
# Split rationale: hooks must be fast + non-blocking; tagger needs an LLM.
#
# This script MUST NOT block the tool call and MUST NOT fail the hook —
# every error path exits 0 after logging.

set -euo pipefail

# ---------- Configuration defaults (overridable via env) ----------
RISK_DIR="${RISK_PIPELINE_DIR:-.risk-pipeline}"
LOCK_DIR="$RISK_DIR/locks"
HASH_DIR="$RISK_DIR/hashes"
QUEUE="$RISK_DIR/queue.jsonl"
TELEMETRY="$RISK_DIR/telemetry.jsonl"
LOG="$RISK_DIR/hook.log"
DAILY_CAP="${RISK_PIPELINE_DAILY_CAP:-500}"
LOCK_STALE_SEC="${RISK_PIPELINE_LOCK_STALE_SEC:-60}"

log() {
  # Append one line to hook.log; swallow errors so logging never fails the hook.
  printf '%s %s\n' "$(date -Iseconds)" "$*" >>"$LOG" 2>/dev/null || true
}

# Create scaffolding. mkdir -p is idempotent; touch ensures files exist
# before grep/append. All wrapped with || true so a read-only FS logs and
# exits cleanly rather than tripping set -e.
mkdir -p "$LOCK_DIR" "$HASH_DIR" 2>/dev/null || { log "SKIP mkdir-failed dir=$RISK_DIR"; exit 0; }
touch "$QUEUE" "$TELEMETRY" "$LOG" 2>/dev/null || { log "SKIP touch-failed"; exit 0; }

# ---------- Read hook payload from stdin ----------
# Claude Code hook protocol: JSON payload on stdin with tool_name + tool_input.
# Use a short timeout read so missing stdin doesn't hang the hook.
INPUT=""
if [ -t 0 ]; then
  # No stdin attached (manual invocation); leave INPUT empty.
  :
else
  INPUT="$(cat 2>/dev/null || true)"
fi

# jq is required for defensive JSON parsing. Absent → log + succeed.
if ! command -v jq >/dev/null 2>&1; then
  log "SKIP jq-missing"
  exit 0
fi

# Parse defensively — any jq failure yields empty string. Try multiple
# field spellings since the hook payload shape has shifted across CC versions.
TOOL_NAME=""
FILE_PATH=""
if [ -n "$INPUT" ]; then
  TOOL_NAME=$(printf '%s' "$INPUT" | jq -r '.tool_name // .toolName // empty' 2>/dev/null || true)
  FILE_PATH=$(printf '%s' "$INPUT" | jq -r '
    .tool_input.file_path //
    .tool_input.path //
    .toolInput.file_path //
    .toolInput.path //
    empty
  ' 2>/dev/null || true)
fi

# Env-var fallback (older CC versions / manual invocation).
: "${TOOL_NAME:=${CLAUDE_HOOK_TOOL_NAME:-}}"
: "${FILE_PATH:=${CLAUDE_HOOK_FILE_PATH:-}}"

# Only care about file-mutating tools.
case "$TOOL_NAME" in
  Write|Edit|MultiEdit) : ;;
  *) exit 0 ;;
esac

if [ -z "$FILE_PATH" ]; then
  log "SKIP no-file-path tool=$TOOL_NAME"
  exit 0
fi

# ---------- Daily cap gate ----------
TODAY=$(date +%Y-%m-%d)
COUNT_TODAY=0
if [ -s "$TELEMETRY" ]; then
  # Match "date":"YYYY-MM-DD" anywhere on the line. 2>/dev/null swallows
  # the "no match" non-zero exit from grep -c.
  COUNT_TODAY=$(grep -c "\"date\":\"$TODAY\"" "$TELEMETRY" 2>/dev/null || true)
  COUNT_TODAY="${COUNT_TODAY:-0}"
fi

if [ "$COUNT_TODAY" -ge "$DAILY_CAP" ]; then
  log "DEFER daily-cap-reached count=$COUNT_TODAY cap=$DAILY_CAP file=$FILE_PATH"
  exit 0
fi

# ---------- Per-file lock ----------
# Hash the path (not the contents) so concurrent hook fires on the same
# file serialize. 16 hex chars = 64 bits: collision-safe for file paths.
FILE_HASH=$(printf '%s' "$FILE_PATH" | sha256sum | cut -c1-16)
LOCK="$LOCK_DIR/$FILE_HASH.lock"

if [ -e "$LOCK" ]; then
  LOCK_MTIME=$(stat -c %Y "$LOCK" 2>/dev/null || echo 0)
  NOW=$(date +%s)
  LOCK_AGE=$(( NOW - LOCK_MTIME ))
  if [ "$LOCK_AGE" -gt "$LOCK_STALE_SEC" ]; then
    rm -f "$LOCK" 2>/dev/null || true
    log "RECLAIM stale-lock age=${LOCK_AGE}s file=$FILE_PATH"
  else
    log "SKIP locked age=${LOCK_AGE}s file=$FILE_PATH"
    exit 0
  fi
fi

# Create lock + register cleanup. trap fires on normal exit and on signals.
if ! touch "$LOCK" 2>/dev/null; then
  log "SKIP lock-create-failed file=$FILE_PATH"
  exit 0
fi
trap 'rm -f "$LOCK" 2>/dev/null || true' EXIT INT TERM

# ---------- Body-hash whitespace pre-check ----------
# Normalize all whitespace runs → single space, then hash. Comparing this
# against the last-known hash tells us whether anything semantically
# changed. Whitespace-only edits (autoformat, re-indent) skip tagging.
HASH_FILE="$HASH_DIR/$FILE_HASH.hash"

if [ -f "$FILE_PATH" ]; then
  NEW_HASH=$(tr -s '[:space:]' ' ' <"$FILE_PATH" 2>/dev/null | sha256sum | cut -c1-32)
  if [ -n "$NEW_HASH" ] && [ -f "$HASH_FILE" ]; then
    OLD_HASH=$(cat "$HASH_FILE" 2>/dev/null || true)
    if [ -n "$OLD_HASH" ] && [ "$NEW_HASH" = "$OLD_HASH" ]; then
      log "SKIP whitespace-only file=$FILE_PATH"
      exit 0
    fi
  fi
  if [ -n "$NEW_HASH" ]; then
    printf '%s' "$NEW_HASH" >"$HASH_FILE" 2>/dev/null || true
  fi
fi

# ---------- Enqueue ----------
# Two append paths: queue.jsonl (consumer input) + telemetry.jsonl (cap + audit).
# jq -c -n constructs the JSON from named args — safe against paths with quotes.
TS=$(date -Iseconds)

jq -c -n \
  --arg ts "$TS" \
  --arg date "$TODAY" \
  --arg tool "$TOOL_NAME" \
  --arg file "$FILE_PATH" \
  --arg hash "$FILE_HASH" \
  '{ts: $ts, date: $date, event: "enqueue", tool: $tool, file: $file, file_hash: $hash}' \
  >>"$QUEUE" 2>/dev/null || { log "WARN queue-append-failed file=$FILE_PATH"; exit 0; }

jq -c -n \
  --arg ts "$TS" \
  --arg date "$TODAY" \
  --arg file "$FILE_PATH" \
  '{ts: $ts, date: $date, outcome: "enqueued", file: $file}' \
  >>"$TELEMETRY" 2>/dev/null || { log "WARN telemetry-append-failed file=$FILE_PATH"; exit 0; }

log "ENQUEUE file=$FILE_PATH count_today=$((COUNT_TODAY + 1))"
exit 0
