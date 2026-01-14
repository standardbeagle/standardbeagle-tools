#!/usr/bin/env bash
# Track when subagents are spawned (PostToolUse for Task tool)

set -euo pipefail

WORKFLOW_DIR=".claude"
SESSION_FILE="$WORKFLOW_DIR/workflow-session.json"

# Update spawn count
if [ -f "$SESSION_FILE" ] && command -v jq &> /dev/null; then
  jq '.subagent_spawns += 1' "$SESSION_FILE" > "$SESSION_FILE.tmp" && mv "$SESSION_FILE.tmp" "$SESSION_FILE"
fi

# Log spawn (helps track context isolation)
echo "Subagent spawned at $(date -Iseconds)" >> "$WORKFLOW_DIR/workflow-spawns.log" 2>/dev/null || true

exit 0
