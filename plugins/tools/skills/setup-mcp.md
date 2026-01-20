---
name: setup-mcp
description: Install agnt and lci MCP servers with intelligent detection - uses local binary if available, falls back to npx
---

# Tools Plugin MCP Setup

This skill sets up both agnt and lci MCP servers for the complete Standard Beagle toolkit.

## Overview

The tools plugin combines:
- **agnt** - Browser superpowers, process management, frontend debugging
- **lci** - Lightning code intelligence, semantic search

Both can be registered via slop-mcp for centralized management.

The MCP server command resolution follows this priority:
1. **Local binary** - `~/.local/bin/<binary>`, `~/go/bin/<binary>`, or in PATH
2. **npx @standardbeagle/<package>** - Fallback (always available via npm)

## Installation Flow

### Step 1: Detect Binary Locations

Check if binaries are installed locally:

```bash
# Check agnt
for loc in "$HOME/.local/bin/agnt" "$HOME/go/bin/agnt"; do
  if [ -x "$loc" ]; then
    echo "FOUND agnt: $loc"
    AGNT_CMD="$loc"
    break
  fi
done
if [ -z "$AGNT_CMD" ] && command -v agnt &> /dev/null; then
  AGNT_CMD="$(which agnt)"
  echo "FOUND agnt: $AGNT_CMD"
fi
[ -z "$AGNT_CMD" ] && echo "agnt NOT FOUND - will use npx"

# Check lci
for loc in "$HOME/.local/bin/lci" "$HOME/go/bin/lci"; do
  if [ -x "$loc" ]; then
    echo "FOUND lci: $loc"
    LCI_CMD="$loc"
    break
  fi
done
if [ -z "$LCI_CMD" ] && command -v lci &> /dev/null; then
  LCI_CMD="$(which lci)"
  echo "FOUND lci: $LCI_CMD"
fi
[ -z "$LCI_CMD" ] && echo "lci NOT FOUND - will use npx"
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

**If local binary exists:**
```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: {
  "action": "register",
  "name": "agnt",
  "command": "<full-path-to-agnt>",
  "args": ["mcp"],
  "scope": "<scope>"
}
```

**If no local binary (use npx):**
```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: {
  "action": "register",
  "name": "agnt",
  "command": "npx",
  "args": ["-y", "@standardbeagle/agnt", "mcp"],
  "scope": "<scope>"
}
```

For lci (if not registered):

**If local binary exists:**
```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: {
  "action": "register",
  "name": "lci",
  "command": "<full-path-to-lci>",
  "args": ["mcp"],
  "scope": "<scope>"
}
```

**If no local binary (use npx):**
```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: {
  "action": "register",
  "name": "lci",
  "command": "npx",
  "args": ["-y", "@standardbeagle/lci", "mcp"],
  "scope": "<scope>"
}
```

Note: Use full paths (e.g., `/home/username/.local/bin/lci`)

#### Verify Both

```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: { "action": "status" }
```

Both agnt and lci should show as connected.

### Step 3B: Standard Installation

If slop-mcp is not available, configure via mcp.json.

#### Install Binaries (Optional)

For better performance, install locally:

```bash
# Via npm (recommended)
npm install -g @standardbeagle/agnt @standardbeagle/lci

# Via pip
pip install agnt lightning-code-index

# Via Go (lci only)
go install github.com/standardbeagle/lci/cmd/lci@latest
```

#### Configure mcp.json

Add to your Claude Code `.mcp.json`:

**With local binaries:**
```json
{
  "agnt": {
    "command": "agnt",
    "args": ["mcp"]
  },
  "lci": {
    "command": "lci",
    "args": ["mcp"]
  }
}
```

**With npx (no local install needed):**
```json
{
  "agnt": {
    "command": "npx",
    "args": ["-y", "@standardbeagle/agnt", "mcp"]
  },
  "lci": {
    "command": "npx",
    "args": ["-y", "@standardbeagle/lci", "mcp"]
  }
}
```

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

1. **Binary locations**: Which are local vs npx fallback
2. **Installation method used**: slop-mcp or standard mcp.json
3. **Scope** (if slop-mcp): user/project/memory
4. **Verification status**: tools available and working
5. **Available tools**: List of tools from both MCPs
