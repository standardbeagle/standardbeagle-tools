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
# Check common installation locations
for loc in "$HOME/.local/bin/lci" "$HOME/go/bin/lci"; do
  if [ -x "$loc" ]; then
    echo "Binary: $loc"
    "$loc" --version
    exit 0
  fi
done

# Check system PATH
if command -v lci &> /dev/null; then
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
Parameters: { "action": "status" }
```

**Parse the response:**
- If slop-mcp is available and lci is listed: Note the state, tool_count, and source
- If slop-mcp is available but lci is NOT listed: Note that slop-mcp could be used
- If slop-mcp is not available: Skip to standard check

### Step 3: Check Tool Availability

Get detailed information about available tools:

```
Call: mcp__lci__info
Parameters: { "tool": "version" }
```

This returns the lci server version and capabilities.

### Step 4: Verify Index Status

Check if lci has indexed the current project:

```
Call: mcp__lci__code_insight
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
| ~/go/bin/lci | <found/not found> | <version if found> |
| System PATH | <found/not found> | <version if found> |
| Fallback | npx @standardbeagle/lci | <always available> |

**Active**: <which location is being used>

### Registration
| Method | Status | Details |
|--------|--------|---------|
| slop-mcp | <connected/error/unavailable> | <tool count if connected> |
| Standard (mcp.json) | <active/inactive> | <configuration location> |

### Server Info
- **Version**: <lci version>
- **Status**: <connected/error>
- **Tool Count**: <number of tools>

### Index Status
- **Files Indexed**: <count>
- **Symbols**: <count>
- **Languages**: <list>
- **Last Updated**: <timestamp>

### Available Tools
<list of lci tools>

### Recommendations
<any suggestions based on status>
```

## Diagnostic Commands

If issues are detected, suggest these diagnostics:

### Check if lci binary is accessible
```bash
# Check installation locations
for loc in "$HOME/.local/bin/lci" "$HOME/go/bin/lci"; do
  if [ -x "$loc" ]; then
    echo "Found: $loc"
    "$loc" --version
    exit 0
  fi
done

if command -v lci &> /dev/null; then
  echo "Found in PATH: $(which lci)"
  lci --version
else
  echo "Not installed locally - using npx fallback"
  npx -y @standardbeagle/lci --version
fi
```

### Check MCP server startup
```bash
lci mcp --help
# or if using npx:
npx -y @standardbeagle/lci mcp --help
```

### Test MCP communication
```
Call: mcp__lci__search
Parameters: { "pattern": "test", "max": 1 }
```

## Common Issues

### Connection Error (EOF)

If lci shows "failed to connect" with EOF error:
- The `mcp` subcommand may be missing from args
- Correct: `args: ["mcp"]`
- Wrong: `args: []` or no args

### Binary Not Found

If npx fails to find the binary:
1. Clear npm cache: `npm cache clean --force`
2. Try explicit install: `npm install -g @standardbeagle/lci`
3. Verify: `npx @standardbeagle/lci --version`

### Duplicate Registration

If lci is registered in BOTH slop-mcp AND standard mcp.json:
- Tools may appear twice with different prefixes
- Recommend choosing one method
- For slop-mcp only: The plugin's mcp.json.disabled should stay disabled
- For standard only: Unregister from slop-mcp

### Index Not Found

If code_insight returns no results:
- lci builds its index automatically on first use
- Or run manually: `lci status` in project root
- Check `.lci.kdl` configuration if files are excluded

## Migration Path

### From npx to local binary
1. Install lci locally:
   ```bash
   npm install -g @standardbeagle/lci
   # or
   go install github.com/standardbeagle/lci/cmd/lci@latest
   ```
2. Update slop-mcp registration to use the local binary path
3. Verify with `lci --version`

### Updating slop-mcp registration
```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: {
  "action": "register",
  "name": "lci",
  "command": "<new-command>",
  "args": ["mcp"],
  "scope": "user"
}
```
