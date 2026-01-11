---
name: setup-mcp
description: Install agnt and lci MCP servers with intelligent detection - uses ~/.local/bin if available, falls back to npx
---

# Tools Plugin MCP Setup

This skill sets up both agnt and lci MCP servers for the complete Standard Beagle toolkit.

## Overview

The tools plugin combines:
- **agnt** - Browser superpowers, process management, frontend debugging
- **lci** - Lightning code intelligence, semantic search

Both can be registered via slop-mcp for centralized management.

The MCP server command resolution follows this priority:
1. **~/.local/bin/<binary>** - Preferred if exists (local installation)
2. **npx @standardbeagle/<package>@latest** - Fallback (always available via npm)

## Installation Flow

### Step 1: Detect Binary Locations

Check if binaries are installed locally:

```bash
# Check agnt
if [ -x "$HOME/.local/bin/agnt" ]; then
  echo "FOUND: ~/.local/bin/agnt"
  AGNT_CMD="$HOME/.local/bin/agnt"
else
  echo "NOT FOUND: ~/.local/bin/agnt - will use npx"
  AGNT_CMD="npx"
fi

# Check lci
if [ -x "$HOME/.local/bin/lci" ]; then
  echo "FOUND: ~/.local/bin/lci"
  LCI_CMD="$HOME/.local/bin/lci"
else
  echo "NOT FOUND: ~/.local/bin/lci - will use npx"
  LCI_CMD="npx"
fi
```

**Record the results** for use in registration.

### Step 2: Detect slop-mcp Availability

```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: { "action": "list" }
```

### Step 3A: Install via slop-mcp

#### Check Current Registrations

Look for "agnt" and "lci" in the list response.

#### Ask User for Scope

| Scope | Location | Use Case |
|-------|----------|----------|
| `user` | `~/.config/slop-mcp/config.kdl` | Personal, persistent |
| `project` | `.slop-mcp.kdl` | Team-shared |
| `memory` | Runtime only | Temporary |

#### Register Missing MCPs

For agnt (if not registered):

**If ~/.local/bin/agnt exists:**
```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: {
  "action": "register",
  "name": "agnt",
  "command": "/home/<user>/.local/bin/agnt",
  "args": ["mcp"],
  "scope": "<scope>"
}
```

**If ~/.local/bin/agnt does NOT exist (use npx):**
```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: {
  "action": "register",
  "name": "agnt",
  "command": "npx",
  "args": ["-y", "@standardbeagle/agnt@latest", "mcp"],
  "scope": "<scope>"
}
```

For lci (if not registered):

**If ~/.local/bin/lci exists:**
```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: {
  "action": "register",
  "name": "lci",
  "command": "/home/<user>/.local/bin/lci",
  "args": ["mcp"],
  "scope": "<scope>"
}
```

**If ~/.local/bin/lci does NOT exist (use npx):**
```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: {
  "action": "register",
  "name": "lci",
  "command": "npx",
  "args": ["-y", "@standardbeagle/lci@latest", "mcp"],
  "scope": "<scope>"
}
```

Note: Expand `~` to full path (e.g., `/home/username/.local/bin/agnt`)

#### Verify Both

```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: { "action": "list" }
```

Both agnt and lci should show as connected.

### Step 3B: Standard Installation

If slop-mcp is not available:

1. Verify binaries are installed:
   ```bash
   # Check ~/.local/bin first (preferred)
   if [ -x "$HOME/.local/bin/agnt" ]; then
     echo "Found: ~/.local/bin/agnt"
     "$HOME/.local/bin/agnt" --version
   elif command -v agnt &> /dev/null; then
     echo "Found: $(which agnt)"
     agnt --version
   else
     echo "agnt not found locally - mcp.json uses npx fallback"
   fi

   if [ -x "$HOME/.local/bin/lci" ]; then
     echo "Found: ~/.local/bin/lci"
     "$HOME/.local/bin/lci" --version
   elif command -v lci &> /dev/null; then
     echo "Found: $(which lci)"
     lci --version
   else
     echo "lci not found locally - mcp.json uses npx fallback"
   fi
   ```

2. If not found and user wants local installation:
   ```bash
   # Via direct download (recommended)
   curl -sSL https://github.com/standardbeagle/agnt/releases/latest/download/agnt-linux-x64 -o ~/.local/bin/agnt
   curl -sSL https://github.com/standardbeagle/lci/releases/latest/download/lci-linux-x64 -o ~/.local/bin/lci
   chmod +x ~/.local/bin/agnt ~/.local/bin/lci
   ```

3. Enable mcp.json:
   ```bash
   mv plugins/tools/mcp.json.disabled plugins/tools/mcp.json
   ```

4. Update plugin.json to add `"mcpServers": "./mcp.json"`

## Available Tools After Setup

### From agnt
- `proxy_start/stop` - Reverse proxy with traffic logging
- `process_start/stop` - Process management
- `browser_inject` - Frontend debugging
- `screenshot` - Browser captures
- `sketch_mode` - Wireframe mode

### From lci
- `search` - Semantic code search
- `find_files` - File path search
- `get_context` - Detailed code context
- `code_insight` - Codebase analysis

## Quick Test

Test both MCPs:
```
Call: mcp__plugin_slop-mcp_slop-mcp__search_tools
Parameters: { "query": "search" }
```

Should return tools from both agnt and lci.

## Summary Output

After setup, provide the user with:

1. **Binary locations**: Which are at ~/.local/bin vs npx fallback
2. **Installation method used**: slop-mcp or standard
3. **Scope** (if slop-mcp): user/project/memory
4. **Verification status**: tools available and working
5. **Available tools**: List of tools from both MCPs
