---
name: setup-mcp
description: Install lci MCP server with intelligent detection - uses ~/.local/bin if available, falls back to npx, supports slop-mcp
---

# LCI MCP Server Setup

This skill provides adaptive installation of the LCI (Lightning Code Index) MCP server. It detects your environment and configures the MCP server appropriately.

## Overview

LCI can be registered in two ways:
1. **Via slop-mcp** - Centralized management with search, discovery, and orchestration
2. **Via standard mcp.json** - Direct plugin-based configuration (already included)

The MCP server command resolution follows this priority:
1. **~/.local/bin/lci** - Preferred if exists (local installation)
2. **npx @standardbeagle/lci@latest** - Fallback (always available via npm)

## Installation Flow

### Step 1: Detect Binary Location

First, check if lci is installed locally:

```bash
if [ -x "$HOME/.local/bin/lci" ]; then
  echo "FOUND: ~/.local/bin/lci"
  "$HOME/.local/bin/lci" --version
else
  echo "NOT FOUND: ~/.local/bin/lci - will use npx"
fi
```

**Record the result** for use in registration:
- If found: Use `~/.local/bin/lci` as command
- If not found: Use `npx` with args `["-y", "@standardbeagle/lci@latest", "mcp"]`

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

**If ~/.local/bin/lci exists:**
```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: {
  "action": "register",
  "name": "lci",
  "command": "/home/<user>/.local/bin/lci",
  "args": ["mcp"],
  "scope": "<user's choice>"
}
```
Note: Expand `~` to full path (e.g., `/home/username/.local/bin/lci`)

**If ~/.local/bin/lci does NOT exist (use npx):**
```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: {
  "action": "register",
  "name": "lci",
  "command": "npx",
  "args": ["-y", "@standardbeagle/lci@latest", "mcp"],
  "scope": "<user's choice>"
}
```

#### Verify Registration

```
Call: mcp__plugin_slop-mcp_slop-mcp__search_tools
Parameters: { "query": "search", "mcp_name": "lci" }
```

If tools are returned, registration was successful.

#### Handle Duplicate Prevention

If lci was registered via slop-mcp, inform the user that:
- The plugin's built-in mcp.json may create duplicate tool registrations
- They can optionally rename `mcp.json` to `mcp.json.disabled` in the lci plugin directory
- Or simply be aware that slop-mcp registration takes precedence

### Step 3B: Standard Installation (No slop-mcp)

When slop-mcp is not available, verify the standard plugin configuration.

#### Verify LCI Binary

Check installation locations in order:

```bash
# Check ~/.local/bin first (preferred)
if [ -x "$HOME/.local/bin/lci" ]; then
  echo "Found: ~/.local/bin/lci"
  "$HOME/.local/bin/lci" --version
# Check system PATH
elif command -v lci &> /dev/null; then
  echo "Found: $(which lci)"
  lci --version
else
  echo "lci not found locally - mcp.json uses npx fallback"
fi
```

If not found and user wants local installation:

```bash
# Via npm (installs to ~/.local/bin with proper npm config)
npm install -g @standardbeagle/lci

# Or via direct download (recommended)
curl -sSL https://github.com/standardbeagle/lci/releases/latest/download/lci-linux-x64 -o ~/.local/bin/lci
chmod +x ~/.local/bin/lci
```

#### Verify MCP Configuration

The plugin's `mcp.json` should already be loaded by Claude Code. Verify by testing a tool:

```
Call: mcp__plugin_lci_lci__info
Parameters: {}
```

If this succeeds, lci is properly configured.

#### Troubleshooting

If tools are not available:
1. Ensure the lci plugin is installed: `claude plugin list`
2. Check plugin source: `claude plugin info lci`
3. Verify mcp.json exists in plugin directory
4. Restart Claude Code to reload MCP servers

## Post-Installation Verification

Regardless of installation method, verify lci is working:

```
Call: mcp__plugin_lci_lci__info
Parameters: { "tool": "search" }
```

This should return information about the search tool.

## Quick Test

Run a simple search to confirm everything works:

```
Call: mcp__plugin_lci_lci__search
Parameters: { "pattern": "main", "max": 5 }
```

## Summary Output

After setup, provide the user with:

1. **Binary location**: ~/.local/bin/lci or npx fallback
2. **Installation method used**: slop-mcp or standard
3. **Scope** (if slop-mcp): user/project/memory
4. **Verification status**: tools available and working
5. **Available tools**: List of lci tools now accessible
6. **Next steps**: Suggest running `/lci:search` or `/lci:explore` commands
