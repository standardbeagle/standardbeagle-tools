---
name: mcp-status
description: Check LCI MCP server registration status across slop-mcp and standard configurations
---

# LCI MCP Status

This skill checks the current registration status of the LCI MCP server and reports on its configuration.

## Status Check Flow

### Step 1: Check Binary Location

First, determine where lci is installed:

```bash
# Check ~/.local/bin first (preferred)
if [ -x "$HOME/.local/bin/lci" ]; then
  echo "Binary: ~/.local/bin/lci"
  "$HOME/.local/bin/lci" --version
# Check system PATH
elif command -v lci &> /dev/null; then
  echo "Binary: $(which lci)"
  lci --version
else
  echo "Binary: npx @standardbeagle/lci (no local installation)"
fi
```

### Step 2: Check slop-mcp Registration

Attempt to query slop-mcp for lci registration:

```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: { "action": "list" }
```

**Parse the response:**
- If slop-mcp is available and lci is listed: Note the scope and configuration
- If slop-mcp is available but lci is NOT listed: Note that slop-mcp could be used
- If slop-mcp is not available: Skip to standard check

### Step 3: Check Standard MCP Registration

Test if lci tools are available via standard plugin configuration:

```
Call: mcp__plugin_lci_lci__info
Parameters: {}
```

**If successful**: Standard mcp.json configuration is active
**If failed**: Standard configuration may have issues

### Step 4: Check Tool Availability

Get detailed information about available tools:

```
Call: mcp__plugin_lci_lci__info
Parameters: { "tool": "version" }
```

This returns the lci server version and capabilities.

### Step 5: Verify Index Status

Check if lci has indexed the current project:

```
Call: mcp__plugin_lci_lci__code_insight
Parameters: { "mode": "statistics" }
```

This shows:
- Number of indexed files
- Indexed symbols
- Languages detected
- Index freshness

## Status Report Format

Generate a status report with:

```markdown
## LCI MCP Status Report

### Binary Location
| Location | Status | Version |
|----------|--------|---------|
| ~/.local/bin/lci | <found/not found> | <version if found> |
| System PATH | <found/not found> | <version if found> |
| Fallback | npx @standardbeagle/lci@latest | <always available> |

**Active**: <which location is being used>

### Registration
| Method | Status | Details |
|--------|--------|---------|
| slop-mcp | <registered/not-registered/unavailable> | <scope if registered> |
| Standard (mcp.json) | <active/inactive> | <path to mcp.json> |

### Server Info
- **Version**: <lci version>
- **Binary Path**: <~/.local/bin/lci or npx>
- **Status**: <running/stopped/unknown>

### Index Status
- **Files Indexed**: <count>
- **Symbols**: <count>
- **Languages**: <list>
- **Last Updated**: <timestamp>

### Available Tools
<list of lci_* tools>

### Recommendations
<any suggestions based on status>
```

## Diagnostic Commands

If issues are detected, suggest these diagnostics:

### Check if lci binary is accessible
```bash
# Check ~/.local/bin first (preferred location)
if [ -x "$HOME/.local/bin/lci" ]; then
  echo "Found: ~/.local/bin/lci"
  "$HOME/.local/bin/lci" --version
elif command -v lci &> /dev/null; then
  echo "Found in PATH: $(which lci)"
  lci --version
else
  echo "Not installed locally - using npx fallback"
  npx @standardbeagle/lci@latest --version
fi
```

### Check MCP server startup
```bash
~/.local/bin/lci mcp --help
# or if using npx:
npx @standardbeagle/lci@latest mcp --help
```

### Test MCP communication
```
Call: mcp__plugin_lci_lci__search
Parameters: { "pattern": "test", "max": 1 }
```

## Common Issues

### Binary Location Mismatch

If slop-mcp is using a different binary than expected:
1. Check the registered command in slop-mcp
2. Update registration to use ~/.local/bin/lci if it exists:
   ```
   Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
   Parameters: {
     "action": "register",
     "name": "lci",
     "command": "/home/<user>/.local/bin/lci",
     "args": ["mcp"],
     "scope": "user"
   }
   ```

### Duplicate Registration

If lci is registered in BOTH slop-mcp AND standard mcp.json:
- Tools may appear twice with different prefixes
- Recommend choosing one method and disabling the other
- For slop-mcp: rename plugin's mcp.json to mcp.json.disabled
- For standard: unregister from slop-mcp

### Index Not Found

If code_insight returns no results:
- lci may need to build its index first
- Run: `~/.local/bin/lci index` or `npx @standardbeagle/lci@latest index` in project root
- Or wait for automatic indexing on first search

### Connection Errors

If tools fail with connection errors:
- MCP server may not be running
- Check if ~/.local/bin/lci exists and is executable
- If using npx, verify network connectivity for npm registry

## Migration Path

To migrate between registration methods:

### From Standard to slop-mcp
1. Run `/lci:setup-mcp` skill
2. Choose slop-mcp registration with preferred scope
3. Optionally disable mcp.json in plugin directory

### From slop-mcp to Standard
1. Unregister from slop-mcp:
   ```
   Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
   Parameters: { "action": "unregister", "name": "lci" }
   ```
2. Ensure plugin's mcp.json is enabled (not renamed)
3. Restart Claude Code to reload MCP servers

### From npx to ~/.local/bin
1. Install lci locally:
   ```bash
   curl -sSL https://github.com/standardbeagle/lci/releases/latest/download/lci-linux-x64 -o ~/.local/bin/lci
   chmod +x ~/.local/bin/lci
   ```
2. Update slop-mcp registration to use the local binary
3. Verify with `~/.local/bin/lci --version`
