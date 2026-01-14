#!/usr/bin/env bash
# Track when security-auditor subagent completes

set -euo pipefail

WORKFLOW_DIR=".claude"
SESSION_FILE="$WORKFLOW_DIR/workflow-session.json"

# Update security audit count
if [ -f "$SESSION_FILE" ] && command -v jq &> /dev/null; then
  jq '.security_audits = (.security_audits // 0) + 1' "$SESSION_FILE" > "$SESSION_FILE.tmp" && mv "$SESSION_FILE.tmp" "$SESSION_FILE"
fi

# Log audit
echo "Security audit completed at $(date -Iseconds)" >> "$WORKFLOW_DIR/workflow-security.log" 2>/dev/null || true

exit 0
