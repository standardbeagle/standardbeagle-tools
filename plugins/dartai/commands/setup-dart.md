---
name: setup-dart
description: "Set up dart-query MCP server with SLOP management and configure Dart access token. 以SLOP管理設置dart-query MCP服務器並配置Dart訪問令牌。 Use when: setup dart, configure dart token, install dart-query, first time setup, dart mcp server"
---

# Dart Query Setup

設置 dart-query 供 Claude Code / dartai 用。

## Task

按步做。

### 1. Check token

先查 `DART_TOKEN`。

若無，告之：

1. 入 https://app.itsdart.com
2. Settings > API
3. 產 token
4. 加入 shell profile:
   ```bash
   export DART_TOKEN="your-token-here"
   ```
5. 重開 terminal 或 `source ~/.bashrc` / `~/.zshrc`

驗 token: `echo $DART_TOKEN`

### 2. Install MCP

先試 SLOP-MCP。

查可用性：
```
mcp__plugin_slop-mcp_slop-mcp__get_metadata
```

若有，註冊 dart-query：
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

若無 slop-mcp，直裝：
```bash
claude mcp add dart-query --command "npx" --args "-y @standardbeagle/dart-query@latest" --env "DART_TOKEN=${DART_TOKEN}"
```

### 3. Verify

試 `get_config`。

用 slop-mcp:
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
mcp_name: dart-query
tool_name: get_config
parameters: {}
```

直裝:
```
mcp__plugin_dartai_dart-query__get_config
```

應回 workspace config: dartboards / statuses / assignees。

若 fail，查 token。

## Tools

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

**Access Pattern:**
- SLOP: `mcp__plugin_slop-mcp_slop-mcp__execute_tool` with `mcp_name: dart-query, tool_name: <tool>`
- Direct: `mcp__plugin_dartai_dart-query__<tool>`

## Troubleshooting

### Token Not Found

驗 token：
```bash
echo $DART_TOKEN
# Should show their token (dsa_...)
```

若無，叫佢加到 shell profile 再重開 terminal。

### Server Not Responding

直測 server：
```bash
npx @standardbeagle/dart-query info
```

若用 SLOP，查狀態：
```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
action: status
name: dart-query
```

### Auth Errors

- token 有效且未過期
- token 有 workspace 權限
- 必要時重生 token: https://app.itsdart.com/settings/api

### Tool Not Found

若無 tool：
1. 查是否安裝成功
2. 查是否已註冊: `claude mcp list` 或 SLOP `manage_mcps action: list`
3. 試 reconnect: SLOP `manage_mcps action: reconnect, name: dart-query`
4. 必要時重裝

## Next Steps

設置後：
1. `/dartai-config`
2. `/start`
3. `/task`
