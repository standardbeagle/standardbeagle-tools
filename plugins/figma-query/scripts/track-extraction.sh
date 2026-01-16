#!/usr/bin/env bash
# Track library-extractor subagent completion

set -euo pipefail

STATE_FILE=".claude/figma-extraction-state.json"
mkdir -p "$(dirname "$STATE_FILE")"

# Initialize or update state
if [ -f "$STATE_FILE" ]; then
  if command -v jq &> /dev/null; then
    jq '.extraction_iterations += 1 | .last_extraction_at = now | .status = "extraction_complete"' "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"
  fi
else
  echo '{"extraction_iterations": 1, "status": "extraction_complete", "continue_loop": true}' > "$STATE_FILE"
fi

echo '{"success": true, "message": "Library extraction completed, ready for next phase"}'
