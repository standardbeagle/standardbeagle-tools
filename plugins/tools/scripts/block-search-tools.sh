#!/usr/bin/env bash
set -euo pipefail

# Force-LCI mode hook: blocks Grep and Glob when force mode is enabled
# State file location
FORCE_MODE_FILE="$HOME/.config/claude-code/lci-force-mode"

# Check if force mode is enabled
if [ ! -f "$FORCE_MODE_FILE" ]; then
  # Force mode disabled, allow all tools
  exit 0
fi

# Get the tool name from environment variable set by Claude Code
TOOL_NAME="${TOOL_NAME:-}"

# Block Grep and Glob tools
if [[ "$TOOL_NAME" == "Grep" ]] || [[ "$TOOL_NAME" == "Glob" ]]; then
  cat >&2 <<EOF
❌ Force-LCI mode is enabled. The $TOOL_NAME tool is blocked.

Please use Lightning Code Index (LCI) tools instead:
  • Use the LCI MCP search tool for code searches
  • Use /search command for semantic code search
  • Use /explore command to explore the codebase

To disable force-LCI mode, run:
  rm -f ~/.config/claude-code/lci-force-mode

Or ask Claude to disable force-LCI mode using the force-lci skill.
EOF
  exit 1
fi

# Allow all other tools
exit 0
