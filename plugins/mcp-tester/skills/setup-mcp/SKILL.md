---
name: mcp-tester-setup-mcp
description: "Install and register mcp-debug MCP server; prefers ~/.local/bin, falls back to npx. 安裝 mcp-debug 伺服器，優先本地執行檔，退則 npx。 Use when: first-time mcp-tester setup, registering mcp-debug with slop-mcp, configuring MCP testing environment."
disable-model-invocation: true
---

# MCP Tester Setup

此技設置 mcp-debug MCP 伺服器，用於測試、除錯、開發 MCP 伺服器。

## Overview

mcp-tester 插件藉 mcp-debug 實現：
- **動態伺服器管理** — 執行時加入/移除 MCP 伺服器
- **流量分析** — 檢視 JSON-RPC 訊息
- **模式驗證** — 驗工具模式
- **熱換開發** — 不重啟替換伺服器

MCP 伺服器命令解析優先順序：
1. **~/.local/bin/mcp-debug** — 若存在則優先（本地安裝）
2. **npx @standardbeagle/mcp-debug@latest** — 退路（隨時可用）

## Installation Flow

### Step 1: Detect Binary Location

查 mcp-debug 是否已本地安裝：

```bash
if [ -x "$HOME/.local/bin/mcp-debug" ]; then
  echo "FOUND: ~/.local/bin/mcp-debug"
  "$HOME/.local/bin/mcp-debug" --version
else
  echo "NOT FOUND: ~/.local/bin/mcp-debug - will use npx"
fi
```

**記錄結果**以備登記之用。

### Step 2: Detect slop-mcp Availability

```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: { "action": "list" }
```

### Step 3A: Install via slop-mcp

#### Check if mcp-debug Already Registered

於列表中尋 "mcp-debug"。若已存在，報告狀態，略去後續。

#### Ask User for Scope

| Scope | Location | Use Case |
|-------|----------|----------|
| `user` | `~/.config/slop-mcp/config.kdl` | 個人持久 |
| `project` | `.slop-mcp.kdl` | 團隊共享 |
| `memory` | Runtime only | 測試用 |

#### Register mcp-debug

**若 ~/.local/bin/mcp-debug 存在：**
```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: {
  "action": "register",
  "name": "mcp-debug",
  "command": "/home/<user>/.local/bin/mcp-debug",
  "args": [],
  "scope": "<scope>"
}
```
注：展開 `~` 為完整路徑（如 `/home/username/.local/bin/mcp-debug`）

**若 ~/.local/bin/mcp-debug 不存在（用 npx）：**
```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: {
  "action": "register",
  "name": "mcp-debug",
  "command": "npx",
  "args": ["-y", "@standardbeagle/mcp-debug@latest"],
  "scope": "<scope>"
}
```

#### Verify Registration

```
Call: mcp__plugin_slop-mcp_slop-mcp__search_tools
Parameters: { "mcp_name": "mcp-debug" }
```

### Step 3B: Standard Installation

若 slop-mcp 不可用：

1. 查 mcp-debug 是否可用：
   ```bash
   # Check ~/.local/bin first (preferred)
   if [ -x "$HOME/.local/bin/mcp-debug" ]; then
     echo "Found: ~/.local/bin/mcp-debug"
     "$HOME/.local/bin/mcp-debug" --version
   # Check system PATH
   elif command -v mcp-debug &> /dev/null; then
     echo "Found: $(which mcp-debug)"
     mcp-debug --version
   else
     echo "mcp-debug not found locally - mcp.json uses npx fallback"
   fi
   ```

2. 若未找到而用戶欲本地安裝：
   ```bash
   # Via npm
   npm install -g @standardbeagle/mcp-debug

   # Or via direct download (recommended)
   curl -sSL https://github.com/standardbeagle/mcp-debug/releases/latest/download/mcp-debug-linux-x64 -o ~/.local/bin/mcp-debug
   chmod +x ~/.local/bin/mcp-debug
   ```

3. 啟用 mcp.json：
   ```bash
   mv plugins/mcp-tester/mcp.json.disabled plugins/mcp-tester/mcp.json
   ```

4. 更新 plugin.json，加入 `"mcpServers": "./mcp.json"`

## Available Tools

| Tool | Description |
|------|-------------|
| `server_add` | 動態加入 MCP 伺服器 |
| `server_remove` | 移除受管伺服器 |
| `server_list` | 列所有受管伺服器 |
| `debug_logs` | 取流量日誌 |
| `debug_send` | 發送原始 JSON-RPC 訊息 |
| `schema_validate` | 驗工具模式 |

## Integration with Commands

安裝後可用：
- `/mcp-tester:add-server` — 加入伺服器供測試
- `/mcp-tester:debug-logs` — 查流量
- `/mcp-tester:validate-schema` — 查合規
- `/mcp-tester:hot-swap` — 即時替換伺服器

> Invoke the `Skill` tool with `skill: mcp-tester:hot-swap-development` — 熱換開發詳流程。

## Quick Test

```
Call: mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "mcp-debug",
  "tool_name": "list_servers",
  "parameters": {}
}
```

## Summary Output

安裝後向用戶報告：

1. **執行檔位置**：~/.local/bin/mcp-debug 或 npx 退路
2. **所用安裝方式**：slop-mcp 或標準
3. **範圍**（若 slop-mcp）：user/project/memory
4. **驗證狀態**：工具可用且正常
5. **可用工具**：mcp-debug 工具列表
