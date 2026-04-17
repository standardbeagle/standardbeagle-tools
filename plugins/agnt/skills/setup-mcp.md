---
name: setup-mcp
description: Install agnt MCP server with intelligent detection - uses ~/.local/bin if available, falls back to npx, supports slop-mcp. 智能安裝agnt MCP服務器：優先本地二進制，退而npx，支持slop-mcp。 Use when: install agnt MCP, setup agnt server, register agnt with slop-mcp, configure agnt MCP server
---

# Agnt MCP服務器設置

自適應安裝agnt MCP服務器，用於瀏覽器超能力、進程管理及前端除錯。

## 概覽

Agnt可以兩種方式注冊：
1. **通過slop-mcp** - 集中管理，含搜尋、發現與編排
2. **通過標準mcp.json** - 直接插件配置

MCP服務器命令解析優先順序：
1. **~/.local/bin/agnt** - 若存在則首選（本地安裝）
2. **npx @standardbeagle/agnt@latest** - 備用（通過npm始終可用）

## 安裝流程

### 步驟一：探測二進制位置

先查 agnt 是否本地安裝：

```bash
if [ -x "$HOME/.local/bin/agnt" ]; then
  echo "FOUND: ~/.local/bin/agnt"
  "$HOME/.local/bin/agnt" --version
else
  echo "NOT FOUND: ~/.local/bin/agnt - will use npx"
fi
```

**記錄結果**以用於注冊：
- 若找到：使用 `~/.local/bin/agnt` 作命令
- 若未找到：使用 `npx` 及參數 `["-y", "@standardbeagle/agnt@latest", "mcp"]`

### 步驟二：探測slop-mcp可用性

查看slop-mcp是否可用：

```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: { "action": "list" }
```

**若成功**：slop-mcp可用，進至步驟3A
**若工具未找到**：slop-mcp不可用，進至步驟3B

### 步驟3A：通過slop-mcp安裝

#### 查看是否已注冊

在 manage_mcps 列表響應中找 "agnt"。若已注冊，報告狀態並跳過。

#### 詢問用戶範圍偏好

| Scope | Location | Use Case |
|-------|----------|----------|
| `user` | `~/.config/slop-mcp/config.kdl` | Personal setup, persists across projects |
| `project` | `.slop-mcp.kdl` | Team-shared, committed to repo |
| `memory` | Runtime only | Temporary, CI environments |

#### 注冊Agnt

**若 ~/.local/bin/agnt 存在：**
```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: {
  "action": "register",
  "name": "agnt",
  "command": "/home/<user>/.local/bin/agnt",
  "args": ["mcp"],
  "scope": "<user's choice>"
}
```
注意：將 `~` 展開為完整路徑（如 `/home/username/.local/bin/agnt`）

**若 ~/.local/bin/agnt 不存在（用npx）：**
```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: {
  "action": "register",
  "name": "agnt",
  "command": "npx",
  "args": ["-y", "@standardbeagle/agnt@latest", "mcp"],
  "scope": "<user's choice>"
}
```

#### 驗證注冊

```
Call: mcp__plugin_slop-mcp_slop-mcp__search_tools
Parameters: { "query": "proxy", "mcp_name": "agnt" }
```

### 步驟3B：標準安裝（無slop-mcp）

#### 驗證Agnt二進制

按順序查看安裝位置：

```bash
# Check ~/.local/bin first (preferred)
if [ -x "$HOME/.local/bin/agnt" ]; then
  echo "Found: ~/.local/bin/agnt"
  "$HOME/.local/bin/agnt" --version
# Check system PATH
elif command -v agnt &> /dev/null; then
  echo "Found: $(which agnt)"
  agnt --version
else
  echo "agnt not found locally - mcp.json uses npx fallback"
fi
```

若未找到且用戶想本地安裝：

```bash
# Via npm (installs to ~/.local/bin with proper npm config)
npm install -g @standardbeagle/agnt

# Or via direct download (recommended)
curl -sSL https://github.com/standardbeagle/agnt/releases/latest/download/agnt-linux-x64 -o ~/.local/bin/agnt
chmod +x ~/.local/bin/agnt
```

#### 啟用mcp.json

將禁用文件重命名：
```bash
mv plugins/agnt/mcp.json.disabled plugins/agnt/mcp.json
```

更新 plugin.json 添加：
```json
"mcpServers": "./mcp.json"
```

## 安裝後可用工具

| Tool | Description |
|------|-------------|
| `proxy_start` | Start reverse proxy with traffic logging |
| `proxy_stop` | Stop running proxy |
| `process_start` | Start and manage processes |
| `process_stop` | Stop managed processes |
| `browser_inject` | Inject diagnostic scripts |
| `screenshot` | Capture browser screenshots |
| `sketch_mode` | Enable wireframe mode |

## 快速測試

```
Call: mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "info",
  "parameters": {}
}
```

## 摘要輸出

設置後，向用戶提供：

1. **二進制位置**：~/.local/bin/agnt 或 npx 備用
2. **使用的安裝方法**：slop-mcp 或標準
3. **範圍**（若slop-mcp）：user/project/memory
4. **驗證狀態**：工具可用且正常
5. **可用工具**：現可訪問之agnt工具列表
