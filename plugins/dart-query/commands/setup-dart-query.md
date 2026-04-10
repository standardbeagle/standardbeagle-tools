---
name: setup-dart-query
description: Set up dart-query MCP server with SLOP management and configure Dart access token
---

# dart-query Setup

This command configures the dart-query MCP server for use with Claude Code.

## Your Task

Follow these steps to set up dart-query:

### Step 1: Check Prerequisites

**REQUIRED**: First, ensure the user has a Dart API token configured.

Ask the user if they have set the `DART_TOKEN` environment variable. If not, instruct them:

1. Log in to your Dart workspace at https://app.dartai.com/?settings=account
2. Go to Account Settings
3. Generate an API token (starts with `dsa_`)
4. Add to shell profile (`~/.bashrc`, `~/.zshrc`, or `~/.profile`):
   ```bash
   export DART_TOKEN="your-token-here"
   ```
5. Restart the terminal or run `source ~/.bashrc` (or `~/.zshrc`)

Verify the token is set by checking: `echo $DART_TOKEN`

### Step 2: Install MCP Server

**Try SLOP-MCP first (preferred):**

Check if slop-mcp is available by calling:
```
mcp__plugin_slop-mcp_slop-mcp__get_metadata
```

If slop-mcp is available, register dart-query with SLOP:
```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
action: register
name: dart-query
type: command
command: npx
args: ["-y", "@standardbeagle/dart-query@latest"]
env: {DART_TOKEN: "${DART_TOKEN}"}
scope: user
```

**If slop-mcp is NOT available, use direct install:**

If the slop-mcp tool call fails (tool not found), fall back to direct Claude MCP install:
```bash
claude mcp add dart-query --command "npx" --args "-y @standardbeagle/dart-query@latest" --env "DART_TOKEN=${DART_TOKEN}"
```

### Step 3: Verify Setup

Test the connection by calling `get_config`:

**If using slop-mcp:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
mcp_name: dart-query
tool_name: get_config
parameters: {}
```

**If using direct install:**
```
mcp__plugin_dart-query_dart-query__get_config
```

This should return the workspace configuration including available dartboards, statuses, and assignees.

If it fails, help the user troubleshoot token configuration.

## Available Tools

After setup, the following dart-query tools are available:

| Tool | Purpose |
|------|---------|
| `info` | Progressive discovery help system |
| `get_config` | Get workspace configuration |
| `list_tasks` | List/filter tasks |
| `get_task` | Get task details |
| `create_task` | Create new task |
| `update_task` | Update task properties |
| `delete_task` | Move task to trash |
| `batch_update_tasks` | Bulk update tasks with DartQL |
| `batch_delete_tasks` | Bulk delete tasks with DartQL |
| `move_task` | Reorder task position |
| `add_task_comment` | Add comment to task |
| `list_comments` | List task comments |
| `attach_url` | Attach file from URL |
| `add_time_tracking` | Track time on task |
| `search_tasks` | Full-text task search |
| `list_docs` | List documents |
| `get_doc` | Get document details |
| `create_doc` | Create new document |
| `update_doc` | Update document |
| `delete_doc` | Move doc to trash |
| `get_dartboard` | Get dartboard info |
| `get_folder` | Get folder info |
| `export_tasks` | Export tasks to CSV |
| `import_tasks` | Import tasks from CSV |
| `get_history` | Get task history |

**Access Pattern:**
- SLOP: `mcp__plugin_slop-mcp_slop-mcp__execute_tool` with `mcp_name: dart-query, tool_name: <tool>`
- Direct: `mcp__plugin_dart-query_dart-query__<tool>`

## Troubleshooting

### Token Not Found
Help the user verify their token:
```bash
echo $DART_TOKEN
# Should show their token (dsa_...)
```

If not set, guide them to add it to their shell profile and restart the terminal.

### Server Not Responding
Test the server directly:
```bash
npx @standardbeagle/dart-query info
```

If using SLOP, check server status:
```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
action: status
name: dart-query
```

### Authentication Errors
- Verify token is valid and not expired
- Check token has appropriate workspace permissions
- Guide user to regenerate token if needed at https://app.dartai.com/?settings=account

### Tool Not Found Errors
If dart-query tools are not available:
1. Verify installation completed successfully
2. Check if server is registered: `claude mcp list` or use SLOP's `manage_mcps` with `action: list`
3. Try reconnecting: use SLOP's `manage_mcps` with `action: reconnect, name: dart-query`
4. Reinstall if necessary

## Next Steps

After setup, use dart-query skills and tools to:
1. Query tasks with DartQL
2. Create and manage tasks in batch
3. Track time and add comments
4. Export and import tasks
5. Explore workspace configuration
