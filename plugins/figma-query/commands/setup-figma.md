---
name: setup-figma
description: Set up figma-query MCP server with SLOP management and configure Figma access token
---

# Figma Query Setup

This command configures the figma-query MCP server for use with Claude Code.

## Setup Steps

### Step 1: Check Prerequisites

1. **Figma Personal Access Token**
   - Go to https://www.figma.com/developers/api#authentication
   - Click "Get personal access token"
   - Copy the token

2. **Set Environment Variable**
   Add to your shell profile (`~/.bashrc`, `~/.zshrc`):
   ```bash
   export FIGMA_ACCESS_TOKEN="your-token-here"
   ```

### Step 2: Register with SLOP

Register the figma-query MCP server with SLOP for centralized management:

```yaml
mcp_name: slop-mcp
tool_name: manage_mcps
parameters:
  action: register
  name: figma-query
  type: command
  command: npx
  args:
    - "-y"
    - "@standardbeagle/figma-query@latest"
  env:
    FIGMA_ACCESS_TOKEN: "${FIGMA_ACCESS_TOKEN}"
  scope: user
```

### Step 3: Verify Setup

Test the connection:

```yaml
mcp_name: figma-query
tool_name: info
parameters:
  topic: status
```

## Quick Reference

After setup, use these tools via SLOP:

| Tool | Purpose |
|------|---------|
| `info` | Help and status |
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

## Troubleshooting

### Token Not Found
```bash
# Check token is set
echo $FIGMA_ACCESS_TOKEN

# Should show your token (figd_...)
```

### Server Not Responding
```bash
# Test npx directly
npx @standardbeagle/figma-query info

# Check SLOP status
# Use manage_mcps with action: status
```

### Rate Limited
- Figma API has rate limits
- Use `sync_file` to cache locally
- Query from cache with `from_cache: true`

## Next Steps

After setup:
1. Use `/design-sync` to sync a Figma file
2. Use `/extract-library` to extract a full design library
