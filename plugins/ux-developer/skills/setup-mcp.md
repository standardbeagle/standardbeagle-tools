---
name: setup-mcp
description: Install agnt MCP server for UX development workflows - uses ~/.local/bin if available, falls back to npx. 為UX工作流安裝agnt MCP服務器：自動選擇本地二進制或npx。 Use when: first-time ux-developer plugin setup, configuring agnt for a11y audits or screenshots.
---

# UX Developer MCP Setup

本技能為UX驅動開發工作流配置agnt MCP服務器，包括無障礙審計、截圖、瀏覽器調試與性能審計。

## Overview

ux-developer插件使用agnt進行：
- **Accessibility audits** - 通過瀏覽器注入自動化a11y檢查
- **Screenshots** - UI變更視覺驗證
- **Browser debugging** - 控制台錯誤、網絡問題、DOM檢查
- **Performance audits** - Core Web Vitals及加載指標

MCP服務器命令解析優先級：
1. **~/.local/bin/agnt** - 若存在優先使用（本地安裝）
2. **npx @standardbeagle/agnt@latest** - 後備方案（npm始終可用）

## Installation Flow

### Step 1: Detect Binary Location

檢查agnt是否本地安裝：

```bash
if [ -x "$HOME/.local/bin/agnt" ]; then
  echo "FOUND: ~/.local/bin/agnt"
  "$HOME/.local/bin/agnt" --version
else
  echo "NOT FOUND: ~/.local/bin/agnt - will use npx"
fi
```

**記錄結果**，用於後續注冊。

### Step 2: Detect slop-mcp Availability

```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: { "action": "list" }
```

### Step 3A: Install via slop-mcp

#### Check if agnt Already Registered

在列表中查找"agnt"。若存在，報告狀態並跳過注冊。

#### Ask User for Scope

| Scope | Location | Use Case |
|-------|----------|----------|
| `user` | `~/.config/slop-mcp/config.kdl` | Personal, persistent |
| `project` | `.slop-mcp.kdl` | Team-shared |
| `memory` | Runtime only | Temporary |

#### Register Agnt

**If ~/.local/bin/agnt exists:**
```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: {
  "action": "register",
  "name": "agnt",
  "command": "/home/<user>/.local/bin/agnt",
  "args": ["mcp"],
  "scope": "<scope>"
}
```
Note: Expand `~` to full path (e.g., `/home/username/.local/bin/agnt`)

**If ~/.local/bin/agnt does NOT exist (use npx):**
```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: {
  "action": "register",
  "name": "agnt",
  "command": "npx",
  "args": ["-y", "@standardbeagle/agnt@latest", "mcp"],
  "scope": "<scope>"
}
```

#### Verify Registration

```
Call: mcp__plugin_slop-mcp_slop-mcp__search_tools
Parameters: { "query": "screenshot", "mcp_name": "agnt" }
```

### Step 3B: Standard Installation

若slop-mcp不可用：

1. 檢查agnt是否可用：
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

2. 若未找到且用戶需本地安裝：
   ```bash
   # Via direct download (recommended)
   curl -sSL https://github.com/standardbeagle/agnt/releases/latest/download/agnt-linux-x64 -o ~/.local/bin/agnt
   chmod +x ~/.local/bin/agnt
   ```

3. 啟用mcp.json：
   ```bash
   mv plugins/ux-developer/mcp.json.disabled plugins/ux-developer/mcp.json
   ```

4. 更新plugin.json，添加 `"mcpServers": "./mcp.json"`

## Tools Used by UX Developer

| Tool | UX Use Case |
|------|-------------|
| `proxy` | Start reverse proxy to intercept traffic, execute JS in browser, send toast notifications |
| `proxylog` | Query HTTP traffic logs, summarize errors, check performance metrics |
| `currentpage` | Get page session data: resources, errors, interactions, DOM mutations |
| `get_errors` | Collect all errors across processes and browser |
| `automation` | Browser automation: screenshots (viewport/fullpage/element), navigation, JS evaluation |
| `browser` | Launch and manage Chrome instances for testing |

## Integration with UX Commands

配置完成後，以下命令將獲得完整功能：
- `/ux-developer:a11y-check` - 使用瀏覽器注入進行審計
- `/ux-developer:ux-verify` - 使用截圖進行驗證
- `/ux-developer:component-ux` - 使用瀏覽器工具分析

## Quick Test

```
Call: mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "agnt",
  "tool_name": "detect",
  "parameters": {}
}
```

## Summary Output

配置完成後，向用戶提供：

1. **Binary location**: ~/.local/bin/agnt or npx fallback
2. **Installation method used**: slop-mcp or standard
3. **Scope** (if slop-mcp): user/project/memory
4. **Verification status**: tools available and working
5. **UX tools available**: proxy, proxylog, currentpage, get_errors, automation, browser
