---
name: setup-mcp
description: Set up figma-query MCP server using slop-mcp for centralized MCP management. 通過 slop-mcp 配置 figma-query MCP 服務器。 Use when: first-time figma-query setup, registering figma-query with SLOP, configuring Figma access token, troubleshooting MCP connection, verifying server status
---

# Figma Query MCP Setup via SLOP

此技能通過 slop-mcp 配置 figma-query MCP 服務器，實現統一 MCP 管理。

## Prerequisites

1. **Figma Personal Access Token**: 從 https://www.figma.com/developers/api#authentication 獲取
2. **slop-mcp installed**: SLOP MCP 協調器必須可用

## Setup Steps

### Step 1: Check SLOP Status

首先驗證 slop-mcp 可用：

```
Use mcp__plugin_slop-mcp_slop-mcp__manage_mcps with action: "status"
```

### Step 2: Register figma-query with SLOP

注冊 figma-query MCP 服務器：

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

使用上述參數調用 `mcp__plugin_slop-mcp_slop-mcp__manage_mcps`。

### Step 3: Verify Registration

```yaml
action: list
```

確認 figma-query 出現在列表中。

### Step 4: Test Connection

執行 info 工具驗證服務器正常運行：

```yaml
mcp_name: figma-query
tool_name: info
parameters:
  topic: status
```

使用 `mcp__plugin_slop-mcp_slop-mcp__execute_tool` 運行測試。

## Environment Variable Setup

### Option 1: Shell Environment (Recommended)

添加至 shell 配置文件（`~/.bashrc`、`~/.zshrc` 等）：

```bash
export FIGMA_ACCESS_TOKEN="your-figma-token-here"
```

### Option 2: Project-specific .env

在項目根目錄創建 `.env`：

```
FIGMA_ACCESS_TOKEN=your-figma-token-here
```

### Option 3: SLOP Configuration

使用 `scope: "user"` 注冊時，令牌將存儲於 SLOP 配置中。

## Troubleshooting

### "Token not found" Error

1. 驗證 `FIGMA_ACCESS_TOKEN` 已設置：`echo $FIGMA_ACCESS_TOKEN`
2. 確認令牌在 Figma 中有效
3. 若已過期，重新生成令牌

### "Server not responding" Error

1. 確認 npx 可訪問 npm：`npx @standardbeagle/figma-query --version`
2. 驗證網絡連接
3. 檢查 SLOP 狀態：使用 `action: "status"` 調用 `mcp__plugin_slop-mcp_slop-mcp__manage_mcps`

### "Rate limited" Error

Figma API 有速率限制。等待重試，或：
1. 用 `sync_file` 本地緩存數據
2. 用 `from_cache: true` 查詢緩存，避免 API 調用

## Unregistering

從 SLOP 移除 figma-query：

```yaml
action: unregister
name: figma-query
```

## Next Steps

設置完成後，使用以下技能：

> Invoke the `Skill` tool with `skill: figma-query:figma-info` — 獲取幫助與服務器狀態。

> Invoke the `Skill` tool with `skill: figma-query:figma-sync` — 將完整 Figma 文件導出到本地緩存。

> Invoke the `Skill` tool with `skill: figma-query:figma-components` — 列出文件中所有組件。
