---
name: figma-query-setup-figma
description: "\"Set up figma-query MCP server with SLOP management and configure Figma access token. 配置 figma-query MCP 服務器及 Figma 訪問令牌。 Use when: setting up figma-query for first time, configuring figma access token, installing figma mcp server, troubleshooting figma connection, registering figma-query with slop\""
disable-model-invocation: true
---

# Figma Query Setup

配置 figma-query MCP 服務器供 Claude Code 使用。

## Your Task

按以下步驟設置 figma-query：

### Step 1: Check Prerequisites

**REQUIRED:** 首先確認用戶已配置 Figma 訪問令牌。

詢問用戶是否已設置 `FIGMA_ACCESS_TOKEN` 環境變量。若未設置，指引：

1. 訪問 https://www.figma.com/developers/api#authentication
2. 點擊「Get personal access token」
3. 複製令牌
4. 添加至 shell 配置文件（`~/.bashrc`、`~/.zshrc`）：
   ```bash
   export FIGMA_ACCESS_TOKEN="your-token-here"
   ```
5. 重啟終端或執行 `source ~/.bashrc`（或 `~/.zshrc`）

核查令牌已設置：`echo $FIGMA_ACCESS_TOKEN`

### Step 2: Install MCP Server

**優先嘗試 SLOP-MCP：**

調用以下工具檢查 slop-mcp 可用性：
```
mcp__plugin_slop-mcp_slop-mcp__get_metadata
```

若 slop-mcp 可用，以 SLOP 註冊 figma-query：
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

**若 slop-mcp 不可用，直接安裝：**

若 slop-mcp 工具調用失敗（工具未找到），回退至直接 Claude MCP 安裝：
```bash
claude mcp add figma-query --command "npx" --args "-y @standardbeagle/figma-query@latest" --env "FIGMA_ACCESS_TOKEN=${FIGMA_ACCESS_TOKEN}"
```

### Step 3: Verify Setup

調用 `info` 測試連接：

**使用 slop-mcp：**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
mcp_name: figma-query
tool_name: info
parameters: {topic: "status"}
```

**使用直接安裝：**
```
mcp__plugin_figma-query_figma-query__info
topic: status
```

應返回 figma-query 服務器狀態信息。若失敗，協助用戶排查令牌配置。

## Available Tools

設置完成後，以下 figma-query 工具可用：

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

**訪問模式：**
- SLOP: `mcp__plugin_slop-mcp_slop-mcp__execute_tool` with `mcp_name: figma-query, tool_name: <tool>`
- Direct: `mcp__plugin_figma-query_figma-query__<tool>`

## Troubleshooting

### Token Not Found

協助用戶核查令牌：
```bash
echo $FIGMA_ACCESS_TOKEN
# Should show their token (figd_...)
```

若未設置，指引添加至 shell 配置文件並重啟終端。

### Server Not Responding

直接測試服務器：
```bash
npx @standardbeagle/figma-query info
```

若使用 SLOP，檢查服務器狀態：
```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
action: status
name: figma-query
```

### Tool Not Found Errors

若 figma-query 工具不可用：
1. 確認安裝已成功完成
2. 核查服務器是否已註冊：`claude mcp list` 或用 SLOP 的 `manage_mcps`（`action: list`）
3. 嘗試重連：用 SLOP 的 `manage_mcps`（`action: reconnect, name: figma-query`）
4. 必要時重新安裝

### Rate Limited

- Figma API 有速率限制（查閱文檔了解當前限制）
- 用 `sync_file` 在本地緩存文件
- 用 `from_cache: true` 參數從緩存查詢，避免 API 調用

## Next Steps

設置後：
1. 用 `/design-sync` 同步 Figma 文件
2. 用 `/extract-library` 提取完整設計庫
