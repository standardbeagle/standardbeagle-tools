---
name: setup-mcp
description: Install lci MCP server with intelligent detection - uses local binary if available, falls back to npx
---

# LCI MCP Server Setup

This skill provides adaptive installation of the LCI (Lightning Code Index) MCP server. It detects your environment and configures the MCP server appropriately.

## Overview

LCI can be registered in two ways:
1. **Via slop-mcp** - Centralized management with search, discovery, and orchestration
2. **Via standard mcp.json** - Direct configuration in Claude Code settings

The MCP server command resolution follows this priority:
1. **Local binary** - `~/.local/bin/lci`, `~/go/bin/lci`, or in PATH
2. **npx @standardbeagle/lci** - Fallback (always available via npm)

## Installation Flow

### Step 1: Detect Binary Location

First, check if lci is installed locally:

```bash
# Check common installation locations
for loc in "$HOME/.local/bin/lci" "$HOME/go/bin/lci"; do
  if [ -x "$loc" ]; then
    echo "FOUND: $loc"
    "$loc" --version
    exit 0
  fi
done

# Check PATH
if command -v lci &> /dev/null; then
  echo "FOUND: $(which lci)"
  lci --version
else
  echo "NOT FOUND locally - will use npx"
fi
```

**Record the result** for use in registration:
- If found: Use the full path as command
- If not found: Use `npx` with args `["-y", "@standardbeagle/lci", "mcp"]`

### Step 2: Detect slop-mcp Availability

Check if slop-mcp is available:

```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: { "action": "list" }
```

**If successful** (returns list of MCPs): slop-mcp is available, proceed to Step 3A
**If tool not found or errors**: slop-mcp not available, proceed to Step 3B

### Step 3A: Install via slop-mcp

When slop-mcp is available, register LCI through it for centralized management.

#### Check if Already Registered

Look for "lci" in the manage_mcps list response. If already registered, report status and skip registration.

#### Ask User for Scope Preference

Present the user with scope options:

| Scope | Location | Use Case |
|-------|----------|----------|
| `user` | `~/.config/slop-mcp/config.kdl` | Personal setup, persists across projects |
| `project` | `.slop-mcp.kdl` | Team-shared, committed to repo |
| `memory` | Runtime only | Temporary, CI environments |

Default recommendation: `user` for persistent personal installation.

#### Register LCI

**If local binary exists:**
```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: {
  "action": "register",
  "name": "lci",
  "command": "<full-path-to-lci>",
  "args": ["mcp"],
  "scope": "<user's choice>"
}
```
Note: Use full path (e.g., `/home/username/.local/bin/lci` or `/home/username/go/bin/lci`)

**If no local binary (use npx):**
```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: {
  "action": "register",
  "name": "lci",
  "command": "npx",
  "args": ["-y", "@standardbeagle/lci", "mcp"],
  "scope": "<user's choice>"
}
```

#### Verify Registration

```
Call: mcp__plugin_slop-mcp_slop-mcp__search_tools
Parameters: { "query": "search", "mcp_name": "lci" }
```

If tools are returned, registration was successful.

### Step 3B: Standard Installation (No slop-mcp)

When slop-mcp is not available, configure via mcp.json.

#### Install LCI Binary (Optional)

For better performance, install lci locally:

```bash
# Via npm (recommended)
npm install -g @standardbeagle/lci

# Via pip
pip install lightning-code-index

# Via Go
go install github.com/standardbeagle/lci/cmd/lci@latest

# Via GitHub releases (manual)
# Download from: https://github.com/standardbeagle/lci/releases
# Extract the tarball and move binary to ~/.local/bin/
```

#### Configure mcp.json

Add to your Claude Code `.mcp.json` (or create it):

**With local binary:**
```json
{
  "lci": {
    "command": "lci",
    "args": ["mcp"]
  }
}
```

**With npx (no local install needed):**
```json
{
  "lci": {
    "command": "npx",
    "args": ["-y", "@standardbeagle/lci", "mcp"]
  }
}
```

#### Verify Configuration

Restart Claude Code to reload MCP servers, then test:

```
Call: mcp__lci__info
Parameters: {}
```

## Post-Installation Verification

Regardless of installation method, verify lci is working:

```
Call: mcp__lci__info
Parameters: { "tool": "search" }
```

This should return information about the search tool.

## Quick Test

Run a simple search to confirm everything works:

```
Call: mcp__lci__search
Parameters: { "pattern": "main", "max": 5 }
```

## Summary Output

After setup, provide the user with:

1. **Binary location**: Local path or npx fallback
2. **Installation method used**: slop-mcp or standard mcp.json
3. **Scope** (if slop-mcp): user/project/memory
4. **Verification status**: tools available and working
5. **Available tools**: List of lci tools now accessible
6. **Next steps**: Suggest running `/lci:search` or `/lci:explore` commands
