---
name: force-lci
description: Toggle force-LCI mode to block standard search tools and require LCI
trigger: When user asks to "force lci", "enable force lci mode", "disable force lci mode", "toggle force lci", or similar
---

# Force LCI Mode

This skill toggles "force-LCI mode" which blocks the standard Claude Code search tools (Grep, Glob) and forces all code and filename searches to go through the Lightning Code Index (LCI) MCP server.

## When to Use

Use this skill when:
- User wants to ensure all searches use the semantic search capabilities of LCI
- User wants to benchmark LCI performance by preventing fallback to standard tools
- User prefers LCI's code intelligence features for all searches
- User wants to disable force mode and restore normal tool access

## How It Works

When force-LCI mode is **enabled**:
- `Grep` tool calls are blocked with a message to use LCI search instead
- `Glob` tool calls are blocked with a message to use LCI search instead
- A state file is created at `~/.config/claude-code/lci-force-mode`
- PreToolUse hook intercepts and blocks the standard tools

When force-LCI mode is **disabled**:
- Standard Grep and Glob tools work normally
- State file is removed
- Hook allows all tool use

## Implementation

### To Enable Force-LCI Mode

```bash
# Create state directory and enable flag
mkdir -p ~/.config/claude-code
touch ~/.config/claude-code/lci-force-mode
echo "Force-LCI mode is now ENABLED. All Grep and Glob searches will be blocked. Use LCI tools instead."
```

### To Disable Force-LCI Mode

```bash
# Remove the flag
rm -f ~/.config/claude-code/lci-force-mode
echo "Force-LCI mode is now DISABLED. Standard search tools are available."
```

### To Check Current Status

```bash
if [ -f ~/.config/claude-code/lci-force-mode ]; then
  echo "Force-LCI mode: ENABLED"
else
  echo "Force-LCI mode: DISABLED"
fi
```

## What Claude Should Do

When the user asks to enable/disable/toggle force-LCI mode:

1. **Check current status** using the status check above
2. **Toggle the mode** by creating or removing the state file
3. **Confirm the change** to the user
4. **Explain the effect**:
   - When enabled: "Standard Grep and Glob tools are now blocked. Please use /search or /explore commands, or the LCI MCP tools directly."
   - When disabled: "Standard Grep and Glob tools are now available again."

## Example Usage

**User**: "Enable force LCI mode"

**Claude**:
```bash
mkdir -p ~/.config/claude-code
touch ~/.config/claude-code/lci-force-mode
```

Force-LCI mode is now enabled. All attempts to use the standard Grep and Glob tools will be blocked. Please use:
- `/search <query>` - Semantic code search through LCI
- `/explore` - Explore codebase structure
- LCI MCP tools directly via the tools plugin

**User**: "Search for error handling"

**Claude**: [Attempts Grep, gets blocked by hook, uses LCI search instead]

**User**: "Turn off force LCI mode"

**Claude**:
```bash
rm -f ~/.config/claude-code/lci-force-mode
```

Force-LCI mode is now disabled. Standard Grep and Glob tools are available again.

## Technical Details

The force-LCI mode is implemented via:
- **State file**: `~/.config/claude-code/lci-force-mode` (presence = enabled)
- **PreToolUse hook**: Intercepts Grep and Glob before execution
- **Hook script**: `${CLAUDE_PLUGIN_ROOT}/scripts/block-search-tools.sh`

The hook checks for the state file and blocks tools with exit code 1 if mode is enabled.
