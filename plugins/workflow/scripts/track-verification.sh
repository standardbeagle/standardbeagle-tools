#!/usr/bin/env bash
# Track when quality-verifier subagent completes

set -euo pipefail

WORKFLOW_DIR=".claude"
SESSION_FILE="$WORKFLOW_DIR/workflow-session.json"

# Update verification count
if [ -f "$SESSION_FILE" ] && command -v jq &> /dev/null; then
  # Add verification completion tracking
  jq '.verification_completions = (.verification_completions // 0) + 1' "$SESSION_FILE" > "$SESSION_FILE.tmp" && mv "$SESSION_FILE.tmp" "$SESSION_FILE"
fi

# Log verification
echo "Quality verification completed at $(date -Iseconds)" >> "$WORKFLOW_DIR/workflow-verifications.log" 2>/dev/null || true

exit 0
