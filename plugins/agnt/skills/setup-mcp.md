---
name: setup-mcp
description: Install agnt MCP server with intelligent detection - uses ~/.local/bin if available, falls back to npx, supports slop-mcp
---

# Agnt MCP Server Setup

This skill provides adaptive installation of the agnt MCP server for browser superpowers, process management, and frontend debugging.

## Overview

Agnt can be registered in two ways:
1. **Via slop-mcp** - Centralized management with search, discovery, and orchestration
2. **Via standard mcp.json** - Direct plugin-based configuration

The MCP server command resolution follows this priority:
1. **~/.local/bin/agnt** - Preferred if exists (local installation)
2. **npx @standardbeagle/agnt@latest** - Fallback (always available via npm)

## Installation Flow

### Step 1: Detect Binary Location

First, check if agnt is installed locally:

```bash
if [ -x "$HOME/.local/bin/agnt" ]; then
  echo "FOUND: ~/.local/bin/agnt"
  "$HOME/.local/bin/agnt" --version
else
  echo "NOT FOUND: ~/.local/bin/agnt - will use npx"
fi
```

**Record the result** for use in registration:
- If found: Use `~/.local/bin/agnt` as command
- If not found: Use `npx` with args `["-y", "@standardbeagle/agnt@latest", "mcp"]`

### Step 2: Detect slop-mcp Availability

Check if slop-mcp is available:

```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: { "action": "list" }
```

**If successful**: slop-mcp is available, proceed to Step 3A
**If tool not found**: slop-mcp not available, proceed to Step 3B

### Step 3A: Install via slop-mcp

#### Check if Already Registered

Look for "agnt" in the manage_mcps list response. If already registered, report status and skip.

#### Ask User for Scope Preference

| Scope | Location | Use Case |
|-------|----------|----------|
| `user` | `~/.config/slop-mcp/config.kdl` | Personal setup, persists across projects |
| `project` | `.slop-mcp.kdl` | Team-shared, committed to repo |
| `memory` | Runtime only | Temporary, CI environments |

#### Register Agnt

**If ~/.local/bin/agnt exists:**
```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: {
  "action": "register",
  "name": "agnt",
  "command": "/home/<user>/.local/bin/agnt",
  "args": ["mcp"],
  "scope": "<user's choice>"
}
```
Note: Expand `~` to full path (e.g., `/home/username/.local/bin/agnt`)

**If ~/.local/bin/agnt does NOT exist (use npx):**
```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: {
  "action": "register",
  "name": "agnt",
  "command": "npx",
  "args": ["-y", "@standardbeagle/agnt@latest", "mcp"],
  "scope": "<user's choice>"
}
```

#### Verify Registration

```
Call: mcp__plugin_slop-mcp_slop-mcp__search_tools
Parameters: { "query": "proxy", "mcp_name": "agnt" }
```

### Step 3B: Standard Installation (No slop-mcp)

#### Verify Agnt Binary

Check installation locations in order:

```bash
# Check ~/.local/bin first (preferred)
if [ -x "$HOME/.local/bin/agnt" ]; then
  echo "Found: ~/.local/bin/agnt"
  "$HOME/.local/bin/agnt" --version
# Check system PATH
elif command -v agnt &> /dev/null; then
  echo "Found: $(which agnt)"
  agnt --version
else
  echo "agnt not found locally - mcp.json uses npx fallback"
fi
```

If not found and user wants local installation:

```bash
# Via npm (installs to ~/.local/bin with proper npm config)
npm install -g @standardbeagle/agnt

# Or via direct download (recommended)
curl -sSL https://github.com/standardbeagle/agnt/releases/latest/download/agnt-linux-x64 -o ~/.local/bin/agnt
chmod +x ~/.local/bin/agnt
```

#### Enable mcp.json

Rename the disabled file back:
```bash
mv plugins/agnt/mcp.json.disabled plugins/agnt/mcp.json
```

Update plugin.json to add:
```json
"mcpServers": "./mcp.json"
```

## Available Tools After Setup

| Tool | Description |
|------|-------------|
| `proxy_start` | Start reverse proxy with traffic logging |
| `proxy_stop` | Stop running proxy |
| `process_start` | Start and manage processes |
| `process_stop` | Stop managed processes |
| `browser_inject` | Inject diagnostic scripts |
| `screenshot` | Capture browser screenshots |
| `sketch_mode` | Enable wireframe mode |

## Quick Test

```
Call: mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "info",
  "parameters": {}
}
```

## Summary Output

After setup, provide the user with:

1. **Binary location**: ~/.local/bin/agnt or npx fallback
2. **Installation method used**: slop-mcp or standard
3. **Scope** (if slop-mcp): user/project/memory
4. **Verification status**: tools available and working
5. **Available tools**: List of agnt tools now accessible
