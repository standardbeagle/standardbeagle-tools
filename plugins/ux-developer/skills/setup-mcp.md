---
name: setup-mcp
description: Install agnt MCP server for UX development workflows - uses ~/.local/bin if available, falls back to npx
---

# UX Developer MCP Setup

This skill sets up the agnt MCP server for UX-driven development workflows including accessibility audits, screenshot captures, and browser debugging.

## Overview

The ux-developer plugin uses agnt for:
- **Accessibility audits** - Automated a11y checking via browser injection
- **Screenshots** - Visual verification of UI changes
- **Browser debugging** - Console errors, network issues, DOM inspection
- **Performance audits** - Core Web Vitals and loading metrics

The MCP server command resolution follows this priority:
1. **~/.local/bin/agnt** - Preferred if exists (local installation)
2. **npx @standardbeagle/agnt@latest** - Fallback (always available via npm)

## Installation Flow

### Step 1: Detect Binary Location

Check if agnt is installed locally:

```bash
if [ -x "$HOME/.local/bin/agnt" ]; then
  echo "FOUND: ~/.local/bin/agnt"
  "$HOME/.local/bin/agnt" --version
else
  echo "NOT FOUND: ~/.local/bin/agnt - will use npx"
fi
```

**Record the result** for use in registration.

### Step 2: Detect slop-mcp Availability

```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: { "action": "list" }
```

### Step 3A: Install via slop-mcp

#### Check if agnt Already Registered

Look for "agnt" in the list. If present, report status and skip registration.

#### Ask User for Scope

| Scope | Location | Use Case |
|-------|----------|----------|
| `user` | `~/.config/slop-mcp/config.kdl` | Personal, persistent |
| `project` | `.slop-mcp.kdl` | Team-shared |
| `memory` | Runtime only | Temporary |

#### Register Agnt

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
Note: Expand `~` to full path (e.g., `/home/username/.local/bin/agnt`)

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

#### Verify Registration

```
Call: mcp__plugin_slop-mcp_slop-mcp__search_tools
Parameters: { "query": "screenshot", "mcp_name": "agnt" }
```

### Step 3B: Standard Installation

If slop-mcp not available:

1. Check if agnt is available:
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

2. If not found and user wants local installation:
   ```bash
   # Via direct download (recommended)
   curl -sSL https://github.com/standardbeagle/agnt/releases/latest/download/agnt-linux-x64 -o ~/.local/bin/agnt
   chmod +x ~/.local/bin/agnt
   ```

3. Enable mcp.json:
   ```bash
   mv plugins/ux-developer/mcp.json.disabled plugins/ux-developer/mcp.json
   ```

4. Update plugin.json to add `"mcpServers": "./mcp.json"`

## Tools Used by UX Developer

| Tool | UX Use Case |
|------|-------------|
| `screenshot` | Visual regression, design verification |
| `browser_inject` | Inject a11y audit scripts |
| `proxy_start` | Capture network requests for performance |
| `console_errors` | Detect JS errors affecting UX |

## Integration with UX Commands

After setup, these commands will have full functionality:
- `/ux-developer:a11y-check` - Uses browser injection for audits
- `/ux-developer:ux-verify` - Uses screenshots for verification
- `/ux-developer:component-ux` - Uses browser tools for analysis

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
5. **UX tools available**: screenshot, browser_inject, etc.
