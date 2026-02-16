---
name: setup-figma
description: Set up figma-query MCP server with SLOP management and configure Figma access token
---

# Figma Query Setup

This command configures the figma-query MCP server for use with Claude Code.

## Your Task

Follow these steps to set up figma-query:

### Step 1: Check Prerequisites

**REQUIRED**: First, ensure the user has a Figma access token configured.

Ask the user if they have set the `FIGMA_ACCESS_TOKEN` environment variable. If not, instruct them:

1. Go to https://www.figma.com/developers/api#authentication
2. Click "Get personal access token"
3. Copy the token
4. Add to shell profile (`~/.bashrc`, `~/.zshrc`):
   ```bash
   export FIGMA_ACCESS_TOKEN="your-token-here"
   ```
5. Restart the terminal or run `source ~/.bashrc` (or `~/.zshrc`)

Verify the token is set by checking: `echo $FIGMA_ACCESS_TOKEN`

### Step 2: Install MCP Server

**Try SLOP-MCP first (preferred):**

Check if slop-mcp is available by calling:
```
mcp__plugin_slop-mcp_slop-mcp__get_metadata
```

If slop-mcp is available, register figma-query with SLOP:
```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
action: register
name: figma-query
type: command
command: npx
args: ["-y", "@standardbeagle/figma-query@latest"]
env: {FIGMA_ACCESS_TOKEN: "${FIGMA_ACCESS_TOKEN}"}
scope: user
```

**If slop-mcp is NOT available, use direct install:**

If the slop-mcp tool call fails (tool not found), fall back to direct Claude MCP install:
```bash
claude mcp add figma-query --command "npx" --args "-y @standardbeagle/figma-query@latest" --env "FIGMA_ACCESS_TOKEN=${FIGMA_ACCESS_TOKEN}"
```

### Step 3: Verify Setup

Test the connection by calling `info`:

**If using slop-mcp:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
mcp_name: figma-query
tool_name: info
parameters: {topic: "status"}
```

**If using direct install:**
```
mcp__plugin_figma-query_figma-query__info
topic: status
```

This should return status information about the figma-query server.

If it fails, help the user troubleshoot token configuration.

## Available Tools

After setup, the following figma-query tools are available:

| Tool | Purpose |
|------|---------|
| `info` | Progressive discovery help and status |
| `sync_file` | Export file to local cache |
| `get_tree` | View file structure |
| `list_components` | List all components |
| `list_styles` | List all styles |
| `query` | Query nodes with DSL |
| `search` | Full-text search |
| `get_node` | Get node details |
| `get_css` | Extract CSS |
| `get_tokens` | Get token references |
| `wireframe` | Visual structure |
| `export_assets` | Export images/icons |
| `export_tokens` | Export design tokens |
| `download_image` | Download images |
| `diff` | Compare versions |

**Access Pattern:**
- SLOP: `mcp__plugin_slop-mcp_slop-mcp__execute_tool` with `mcp_name: figma-query, tool_name: <tool>`
- Direct: `mcp__plugin_figma-query_figma-query__<tool>`

## Troubleshooting

### Token Not Found
Help the user verify their token:
```bash
echo $FIGMA_ACCESS_TOKEN
# Should show their token (figd_...)
```

If not set, guide them to add it to their shell profile and restart the terminal.

### Server Not Responding
Test the server directly:
```bash
npx @standardbeagle/figma-query info
```

If using SLOP, check server status:
```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
action: status
name: figma-query
```

### Tool Not Found Errors
If figma-query tools are not available:
1. Verify installation completed successfully
2. Check if server is registered: `claude mcp list` or use SLOP's `manage_mcps` with `action: list`
3. Try reconnecting: use SLOP's `manage_mcps` with `action: reconnect, name: figma-query`
4. Reinstall if necessary

### Rate Limited
- Figma API has rate limits (check docs for current limits)
- Use `sync_file` to cache files locally
- Query from cache with `from_cache: true` parameter to avoid API calls

## Next Steps

After setup:
1. Use `/design-sync` to sync a Figma file
2. Use `/extract-library` to extract a full design library
