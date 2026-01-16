#!/usr/bin/env bash
# Track html-generator subagent completion

set -euo pipefail

STATE_FILE=".claude/figma-extraction-state.json"
mkdir -p "$(dirname "$STATE_FILE")"

if [ -f "$STATE_FILE" ] && command -v jq &> /dev/null; then
  jq '.html_gen_iterations += 1 | .last_html_gen_at = now | .status = "html_generation_complete"' "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"
fi

echo '{"success": true, "message": "HTML generation completed"}'
