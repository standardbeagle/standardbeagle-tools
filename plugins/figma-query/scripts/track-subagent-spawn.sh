#!/usr/bin/env bash
# Track subagent spawns for figma-query operations

set -euo pipefail

STATE_FILE=".claude/figma-extraction-state.json"
mkdir -p "$(dirname "$STATE_FILE")"

if [ -f "$STATE_FILE" ] && command -v jq &> /dev/null; then
  jq '.subagent_spawns += 1' "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"
else
  echo '{"subagent_spawns": 1, "status": "running"}' > "$STATE_FILE"
fi

echo '{"success": true}'
