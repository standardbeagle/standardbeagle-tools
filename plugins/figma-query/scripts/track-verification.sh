#!/usr/bin/env bash
# Track asset-verifier subagent completion

set -euo pipefail

STATE_FILE=".claude/figma-extraction-state.json"
mkdir -p "$(dirname "$STATE_FILE")"

if [ -f "$STATE_FILE" ] && command -v jq &> /dev/null; then
  jq '.verification_iterations += 1 | .last_verification_at = now | .status = "verification_complete"' "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"
fi

echo '{"success": true, "message": "Asset verification completed"}'
