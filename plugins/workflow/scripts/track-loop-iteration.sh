#!/usr/bin/env bash
# Track loop iteration when task-executor subagent completes

set -euo pipefail

# This hook fires when workflow:task-executor subagent stops
# Environment variables available:
# - CLAUDE_SUBAGENT_TYPE (e.g., "workflow:task-executor")
# - CLAUDE_SUBAGENT_ID (unique identifier)
# - Other context from SubagentStop hook

WORKFLOW_DIR=".claude"
SESSION_FILE="$WORKFLOW_DIR/workflow-session.json"
STATE_FILE="$WORKFLOW_DIR/workflow-loop-state.json"

# Update session metrics
if [ -f "$SESSION_FILE" ]; then
  # Use jq to update metrics if available, otherwise basic tracking
  if command -v jq &> /dev/null; then
    # Update completion count
    jq '.subagent_completions += 1' "$SESSION_FILE" > "$SESSION_FILE.tmp" && mv "$SESSION_FILE.tmp" "$SESSION_FILE"

    # Update context barriers (one per task completion)
    jq '.context_barriers_enforced += 1' "$SESSION_FILE" > "$SESSION_FILE.tmp" && mv "$SESSION_FILE.tmp" "$SESSION_FILE"
  else
    # Fallback: append completion record
    echo "Task executor completed at $(date -Iseconds)" >> "$WORKFLOW_DIR/workflow-completions.log"
  fi
fi

# Track completion in state file if it exists
if [ -f "$STATE_FILE" ]; then
  if command -v jq &> /dev/null; then
    # Update total iterations
    jq '.stats.total_iterations += 1' "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"
  fi
fi

# Success
exit 0
