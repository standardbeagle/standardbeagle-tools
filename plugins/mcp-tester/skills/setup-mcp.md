---
name: setup-mcp
description: Install mcp-debug MCP server for testing and debugging MCP servers - uses ~/.local/bin if available, falls back to npx
---

# MCP Tester Setup

This skill sets up the mcp-debug MCP server for testing, debugging, and developing MCP servers.

## Overview

The mcp-tester plugin uses mcp-debug for:
- **Dynamic server management** - Add/remove MCP servers at runtime
- **Traffic analysis** - Inspect JSON-RPC messages
- **Schema validation** - Verify tool schemas
- **Hot-swap development** - Replace servers without restart

The MCP server command resolution follows this priority:
1. **~/.local/bin/mcp-debug** - Preferred if exists (local installation)
2. **npx @standardbeagle/mcp-debug@latest** - Fallback (always available via npm)

## Installation Flow

### Step 1: Detect Binary Location

Check if mcp-debug is installed locally:

```bash
if [ -x "$HOME/.local/bin/mcp-debug" ]; then
  echo "FOUND: ~/.local/bin/mcp-debug"
  "$HOME/.local/bin/mcp-debug" --version
else
  echo "NOT FOUND: ~/.local/bin/mcp-debug - will use npx"
fi
```

**Record the result** for use in registration.

### Step 2: Detect slop-mcp Availability

```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: { "action": "list" }
```

### Step 3A: Install via slop-mcp

#### Check if mcp-debug Already Registered

Look for "mcp-debug" in the list. If present, report status and skip.

#### Ask User for Scope

| Scope | Location | Use Case |
|-------|----------|----------|
| `user` | `~/.config/slop-mcp/config.kdl` | Personal, persistent |
| `project` | `.slop-mcp.kdl` | Team-shared |
| `memory` | Runtime only | Good for testing |

#### Register mcp-debug

**If ~/.local/bin/mcp-debug exists:**
```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: {
  "action": "register",
  "name": "mcp-debug",
  "command": "/home/<user>/.local/bin/mcp-debug",
  "args": [],
  "scope": "<scope>"
}
```
Note: Expand `~` to full path (e.g., `/home/username/.local/bin/mcp-debug`)

**If ~/.local/bin/mcp-debug does NOT exist (use npx):**
```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: {
  "action": "register",
  "name": "mcp-debug",
  "command": "npx",
  "args": ["-y", "@standardbeagle/mcp-debug@latest"],
  "scope": "<scope>"
}
```

#### Verify Registration

```
Call: mcp__plugin_slop-mcp_slop-mcp__search_tools
Parameters: { "mcp_name": "mcp-debug" }
```

### Step 3B: Standard Installation

If slop-mcp not available:

1. Check if mcp-debug is available:
   ```bash
   # Check ~/.local/bin first (preferred)
   if [ -x "$HOME/.local/bin/mcp-debug" ]; then
     echo "Found: ~/.local/bin/mcp-debug"
     "$HOME/.local/bin/mcp-debug" --version
   # Check system PATH
   elif command -v mcp-debug &> /dev/null; then
     echo "Found: $(which mcp-debug)"
     mcp-debug --version
   else
     echo "mcp-debug not found locally - mcp.json uses npx fallback"
   fi
   ```

2. If not found and user wants local installation:
   ```bash
   # Via npm
   npm install -g @standardbeagle/mcp-debug

   # Or via direct download (recommended)
   curl -sSL https://github.com/standardbeagle/mcp-debug/releases/latest/download/mcp-debug-linux-x64 -o ~/.local/bin/mcp-debug
   chmod +x ~/.local/bin/mcp-debug
   ```

3. Enable mcp.json:
   ```bash
   mv plugins/mcp-tester/mcp.json.disabled plugins/mcp-tester/mcp.json
   ```

4. Update plugin.json to add `"mcpServers": "./mcp.json"`

## Available Tools

| Tool | Description |
|------|-------------|
| `add_server` | Dynamically add an MCP server |
| `remove_server` | Remove a managed server |
| `list_servers` | Show all managed servers |
| `get_logs` | Retrieve traffic logs |
| `send_raw` | Send raw JSON-RPC messages |
| `validate_schema` | Validate tool schemas |

## Integration with Commands

After setup:
- `/mcp-tester:add-server` - Add servers for testing
- `/mcp-tester:debug-logs` - View traffic
- `/mcp-tester:validate-schema` - Check compliance
- `/mcp-tester:hot-swap` - Replace servers live

## Quick Test

```
Call: mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "mcp-debug",
  "tool_name": "list_servers",
  "parameters": {}
}
```

## Summary Output

After setup, provide the user with:

1. **Binary location**: ~/.local/bin/mcp-debug or npx fallback
2. **Installation method used**: slop-mcp or standard
3. **Scope** (if slop-mcp): user/project/memory
4. **Verification status**: tools available and working
5. **Available tools**: List of mcp-debug tools
