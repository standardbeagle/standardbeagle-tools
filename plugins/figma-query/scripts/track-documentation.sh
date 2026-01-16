#!/usr/bin/env bash
# Track component-documenter subagent completion

set -euo pipefail

STATE_FILE=".claude/figma-extraction-state.json"
mkdir -p "$(dirname "$STATE_FILE")"

if [ -f "$STATE_FILE" ] && command -v jq &> /dev/null; then
  jq '.documentation_iterations += 1 | .last_doc_at = now | .status = "documentation_complete"' "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"
fi

echo '{"success": true, "message": "Documentation completed"}'
