---
name: slop-mcp-slop-exec
description: "\"Execute a tool on a specific slop-mcp managed MCP server after discovery verifies the target exists. 先以元工具驗證後，方在 slop-mcp 管理之 MCP 服務器執行工具。 Use when: running a known tool, testing a tool's output, executing server.tool format calls.\""
disable-model-invocation: true
---

# Execute MCP Tool

以 `execute_tool` 在特定 MCP 服務器執行工具。**發現先於執行** — 未經元工具驗證之 `mcp_name`、`tool_name`、參數 schema 皆不可信。

## Tool Call

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "<server-name>"
  tool_name: "<tool-name>"
  parameters: { "param1": "value1", "param2": "value2" }
```

## Steps

### Step 0 — Verify Target (Precondition)

若本會話中 `mcp_name` 或 `tool_name` 未經 `search_tools` / `get_metadata` / `manage_mcps list` 返回確認，**必先運行其一**，不得臆測。

Decision tree 決策樹：

- **Server unknown 服務器未知** → 先列：
  ```
  mcp__plugin_slop-mcp_slop-mcp__manage_mcps
    action: "list"
  ```
- **Server known, tool unknown 服務器已知但工具未枚舉** → 搜或列：
  ```
  mcp__plugin_slop-mcp_slop-mcp__search_tools
    query: "<keywords>"
    mcp_name: "<server>"
  ```
  或
  ```
  mcp__plugin_slop-mcp_slop-mcp__get_metadata
    mcp_name: "<server>"
  ```
- **Tool known, schema unknown 工具已知但 schema 未驗** → 取 verbose：
  ```
  mcp__plugin_slop-mcp_slop-mcp__get_metadata
    mcp_name: "<server>"
    tool_name: "<tool>"
    verbose: true
  ```

目標驗證後，方進 Step 1。

### Step 1 — Resolve server.tool and Assemble Parameters

若用戶以 `server.tool` 格式給出，分割為 `mcp_name` + `tool_name`。按 Step 0 取得之 schema 逐鍵填 `parameters` — 鍵名、類型、必填項皆依 schema，不得憑記憶。

### Step 2 — Execute

以已驗證之服務器、工具及 schema-匹配參數調用 `execute_tool`（見上 Tool Call 塊）。

### Step 3 — Present

向用戶呈現結果。錯誤時先回 Step 0 重驗，勿盲改參數重試。

## Forbidden 禁則

以下行為 **禁止** — 遇之即停，改走元工具路徑：

1. **Bash 直呼 MCP 二進製** — `npx @pkg/foo mcp ...`、`uvx <pkg> mcp`、或 heredoc / echo 管道 (`echo '{"method":"tools/call"...}' | <binary>`) 繞過 slop-mcp。一切經 `execute_tool`。
2. **未驗證 `execute_tool`** — 本會話中未經元工具響應確認之 `mcp_name` 或 `tool_name`，禁調。
3. **猜測參數名** — 未運行 `get_metadata verbose:true` 前，不得臆造 `path`/`query` 等鍵名。先取 schema。
4. **跨會話 schema 假設** — 上次會話見過之 schema 不等於此次仍有效；slop-mcp 可能已重連不同版本。每會話重驗。

違規恢復：停止當前動作 → 回 Step 0 → 以驗證後 schema 重試。

## Examples

### Discovery-first sequence 完整發現-執行序列

```
# (a) 列服務器 — 確認 filesystem 已注冊
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "list"

# (b) 取 read_file schema
mcp__plugin_slop-mcp_slop-mcp__get_metadata
  mcp_name: "filesystem"
  tool_name: "read_file"
  verbose: true

# (c) 按 schema 執行
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "filesystem"
  tool_name: "read_file"
  parameters: { "path": "/home/user/README.md" }
```

### Short form — schema already verified this session

```
# Search code via lci server
mcp_name: "lci"
tool_name: "search"
parameters: { "query": "function", "limit": 10 }
```

## Related

- Invoke the `Skill` tool with `skill: slop-mcp:discovery-first` — 完整強制流程、違規列表、恢復路徑。
- Invoke the `Skill` tool with `skill: slop-mcp:slop-config` — KDL 配置、`manage_mcps` 參數、元數據檢查。
- `mcp-orchestrator` 代理 — Prime Directive + Workflow 0 Discovery + Forbidden Patterns 之完整協調者。
- `/slop-search` — 跨服務器關鍵字搜工具（Step 0 工具未知分支之命令形式）。
- `/slop-list` — 列已注冊服務器（Step 0 服務器未知分支之命令形式）。
