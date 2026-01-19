---
name: setup-dart
description: Set up dart-query MCP server with SLOP management and configure Dart access token
---

# Dart Query Setup

This command configures the dart-query MCP server for use with Claude Code and the dartai plugin.

## Setup Steps

### Step 1: Check Prerequisites

1. **Dart API Token**
   - Log in to your Dart workspace at https://app.itsdart.com
   - Go to Settings > API
   - Generate an API token
   - Copy the token

2. **Set Environment Variable**
   Add to your shell profile (`~/.bashrc`, `~/.zshrc`):
   ```bash
   export DART_TOKEN="your-token-here"
   ```

### Step 2: Register with SLOP

Register the dart-query MCP server with SLOP for centralized management:

```yaml
mcp_name: slop-mcp
tool_name: manage_mcps
parameters:
  action: register
  name: dart-query
  type: command
  command: npx
  args:
    - "-y"
    - "@standardbeagle/dart-query@latest"
  env:
    DART_TOKEN: "${DART_TOKEN}"
  scope: user
```

### Step 3: Verify Setup

Test the connection:

```yaml
mcp_name: dart-query
tool_name: get_config
parameters: {}
```

This should return your workspace configuration including available dartboards, statuses, and assignees.

## Quick Reference

After setup, use these tools via SLOP:

| Tool | Purpose |
|------|---------|
| `get_config` | Get workspace configuration |
| `list_tasks` | List/filter tasks |
| `get_task` | Get task details |
| `create_task` | Create new task |
| `update_task` | Update task properties |
| `delete_task` | Move task to trash |
| `move_task` | Reorder task position |
| `add_task_comment` | Add comment to task |
| `list_comments` | List task comments |
| `add_task_attachment_from_url` | Attach file from URL |
| `add_task_time_tracking` | Track time on task |
| `list_docs` | List documents |
| `get_doc` | Get document details |
| `create_doc` | Create new document |
| `update_doc` | Update document |
| `delete_doc` | Move doc to trash |
| `get_dartboard` | Get dartboard info |
| `get_folder` | Get folder info |
| `get_view` | Get view info |

## Troubleshooting

### Token Not Found
```bash
# Check token is set
echo $DART_TOKEN

# Should show your token (dsa_...)
```

### Server Not Responding
```bash
# Test npx directly
npx @standardbeagle/dart-query info

# Check SLOP status
# Use manage_mcps with action: status, name: dart-query
```

### Authentication Errors
- Verify your token is valid and not expired
- Check that the token has appropriate permissions
- Regenerate the token if needed

## Migration from Official Dart MCP

If you were previously using the official `@itsdart/mcp-server-dart`:

1. Register dart-query as shown above
2. Unregister the old server:
   ```yaml
   mcp_name: slop-mcp
   tool_name: manage_mcps
   parameters:
     action: unregister
     name: dart
   ```
3. Update any scripts or configurations referencing `dart` to use `dart-query`

## Next Steps

After setup:
1. Use `/dartai-config` to configure project-specific defaults
2. Use `/start` to begin a Ralph Wiggum adversarial loop
3. Use `/task` to execute individual tasks
