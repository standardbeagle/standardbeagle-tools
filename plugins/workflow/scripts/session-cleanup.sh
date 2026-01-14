#!/usr/bin/env bash
# Session cleanup for workflow plugin

set -euo pipefail

WORKFLOW_DIR=".claude"
SESSION_FILE="$WORKFLOW_DIR/workflow-session.json"

# Update session with end time
if [ -f "$SESSION_FILE" ] && command -v jq &> /dev/null; then
  jq --arg ended_at "$(date -Iseconds)" '. + {ended_at: $ended_at}' "$SESSION_FILE" > "$SESSION_FILE.tmp" && mv "$SESSION_FILE.tmp" "$SESSION_FILE"
fi

# Archive session to history (optional)
HISTORY_DIR="$WORKFLOW_DIR/workflow-history"
mkdir -p "$HISTORY_DIR"

if [ -f "$SESSION_FILE" ]; then
  SESSION_ID=$(cat "$SESSION_FILE" | jq -r '.session_id // "unknown"' 2>/dev/null || echo "unknown")
  cp "$SESSION_FILE" "$HISTORY_DIR/session-${SESSION_ID}.json" 2>/dev/null || true
fi

# Success
exit 0
