#!/usr/bin/env bash
# Session initialization for workflow plugin

set -euo pipefail

# Get workflow directory
WORKFLOW_DIR=".claude"
mkdir -p "$WORKFLOW_DIR"

# Initialize session tracking file
SESSION_FILE="$WORKFLOW_DIR/workflow-session.json"

if [ ! -f "$SESSION_FILE" ]; then
  cat > "$SESSION_FILE" <<EOF
{
  "session_id": "$(uuidgen 2>/dev/null || echo "session-$(date +%s)")",
  "started_at": "$(date -Iseconds)",
  "workflow_version": "0.1.0",
  "subagent_spawns": 0,
  "subagent_completions": 0,
  "context_barriers_enforced": 0,
  "loops_started": 0,
  "tasks_completed": 0,
  "tasks_failed": 0
}
EOF
fi

# Success - silent unless error
exit 0
