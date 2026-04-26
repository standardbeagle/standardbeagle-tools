---
name: setup-dart-query
description: "Set up dart-query MCP server with SLOP management and configure Dart access token. 以SLOP管理配置dart-query MCP服務器及Dart訪問令牌. Use when: install dart-query, setup dart integration, configure DART_TOKEN, first time dart setup, connect dart to claude"
---

# dart-query Setup

此命令為Claude Code配置dart-query MCP服務器。

## Your Task

依下列步驟設置dart-query：

### Step 1: Check Prerequisites

**REQUIRED**: 首先確保用戶已配置Dart API令牌。

詢問用戶是否已設置`DART_TOKEN`環境變量。若未設置，指導如下：

1. Log in to your Dart workspace at https://app.dartai.com/?settings=account
2. Go to Account Settings
3. Generate an API token (starts with `dsa_`)
4. Add to shell profile (`~/.bashrc`, `~/.zshrc`, or `~/.profile`):
   ```bash
   export DART_TOKEN="your-token-here"
   ```
5. Restart the terminal or run `source ~/.bashrc` (or `~/.zshrc`)

驗證令牌已設置：`echo $DART_TOKEN`

### Step 2: Install MCP Server

**首選SLOP-MCP：**

調用以下命令檢查slop-mcp是否可用：
```
mcp__plugin_slop-mcp_slop-mcp__get_metadata
```

若slop-mcp可用，以SLOP注冊dart-query：
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

**若slop-mcp不可用，直接安裝：**

工具調用失敗（工具未找到）時，降級為直接Claude MCP安裝：
```bash
claude mcp add dart-query --command "npx" --args "-y @standardbeagle/dart-query@latest" --env "DART_TOKEN=${DART_TOKEN}"
```

### Step 3: Verify Setup

調用`get_config`測試連接：

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

應返回工作區配置，含可用看板、狀態及受派者。

若失敗，協助用戶排查令牌配置。

## Available Tools

安裝後，以下dart-query工具可用：

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
| `import_tasks_csv` | Import tasks from CSV |
| `execute_dartql` | Execute DartQL batch statements |
| `get_batch_status` | Check batch operation progress |

**Access Pattern:**
- SLOP: `mcp__plugin_slop-mcp_slop-mcp__execute_tool` with `mcp_name: dart-query, tool_name: <tool>`
- Direct: `mcp__plugin_dart-query_dart-query__<tool>`

## Troubleshooting

### Token Not Found
協助用戶驗證令牌：
```bash
echo $DART_TOKEN
# Should show their token (dsa_...)
```

若未設置，引導至shell配置文件添加並重啟終端。

### Server Not Responding
直接測試服務器：
```bash
npx @standardbeagle/dart-query info
```

若使用SLOP，查看服務器狀態：
```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
action: status
name: dart-query
```

### Authentication Errors
- 驗證令牌有效且未過期
- 確認令牌有適當工作區權限
- 需要時引導用戶至 https://app.dartai.com/?settings=account 重新生成

### Tool Not Found Errors
若dart-query工具不可用：
1. 驗證安裝成功完成
2. 查看服務器是否已注冊：`claude mcp list`或SLOP的`manage_mcps`搭配`action: list`
3. 嘗試重連：SLOP的`manage_mcps`搭配`action: reconnect, name: dart-query`
4. 必要時重新安裝

## Next Steps

安裝後，以dart-query技能與工具：
1. 以DartQL查詢任務
2. 批量創建與管理任務
3. 追蹤時間並添加注釋
4. 導出與導入任務
5. 探索工作區配置
