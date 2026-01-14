---
name: setup-mcp
description: Set up figma-query MCP server using slop-mcp for centralized MCP management
---

# Figma Query MCP Setup via SLOP

This skill configures the figma-query MCP server through slop-mcp for unified MCP management.

## Prerequisites

1. **Figma Personal Access Token**: Get from https://www.figma.com/developers/api#authentication
2. **slop-mcp installed**: The SLOP MCP orchestrator must be available

## Setup Steps

### Step 1: Check SLOP Status

First, verify slop-mcp is available:

```
Use mcp__plugin_slop-mcp_slop-mcp__manage_mcps with action: "status"
```

### Step 2: Register figma-query with SLOP

Register the figma-query MCP server:

```yaml
action: register
name: figma-query
type: command
command: npx
args:
  - "-y"
  - "@standardbeagle/figma-query@latest"
env:
  FIGMA_ACCESS_TOKEN: "${FIGMA_ACCESS_TOKEN}"
scope: user  # Saves to ~/.config/slop-mcp/config.kdl
```

Use `mcp__plugin_slop-mcp_slop-mcp__manage_mcps` with the above parameters.

### Step 3: Verify Registration

```yaml
action: list
```

Confirm figma-query appears in the list.

### Step 4: Test Connection

Execute the info tool to verify the server is working:

```yaml
mcp_name: figma-query
tool_name: info
parameters:
  topic: status
```

Use `mcp__plugin_slop-mcp_slop-mcp__execute_tool` to run the test.

## Environment Variable Setup

### Option 1: Shell Environment (Recommended)

Add to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.):

```bash
export FIGMA_ACCESS_TOKEN="your-figma-token-here"
```

### Option 2: Project-specific .env

Create `.env` in your project root:

```
FIGMA_ACCESS_TOKEN=your-figma-token-here
```

### Option 3: SLOP Configuration

When registering with scope: "user", the token will be stored in the SLOP config.

## Troubleshooting

### "Token not found" Error

1. Verify `FIGMA_ACCESS_TOKEN` is set: `echo $FIGMA_ACCESS_TOKEN`
2. Check if token is valid in Figma
3. Regenerate token if expired

### "Server not responding" Error

1. Check npx can reach npm: `npx @standardbeagle/figma-query --version`
2. Verify network connectivity
3. Check SLOP status: `mcp__plugin_slop-mcp_slop-mcp__manage_mcps` with action: "status"

### "Rate limited" Error

Figma API has rate limits. Wait and retry, or:
1. Use `sync_file` to cache data locally
2. Query from cache with `from_cache: true`

## Unregistering

To remove figma-query from SLOP:

```yaml
action: unregister
name: figma-query
```

## Next Steps

After setup, use these skills:
- `figma-info`: Get help and status
- `figma-sync`: Export full Figma file to local cache
- `figma-components`: List all components in a file
