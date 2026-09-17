---
name: lci-setup-mcp
description: "Install lci MCP server with intelligent detection - uses the local binary, installing it first when missing. 智能安裝LCI MCP伺服器，無本地二進位則先裝之。 Use when: first-time lci setup, registering with slop-mcp, configuring mcp.json."
---

# LCI MCP Server Setup

此技能自適應安裝LCI（Lightning Code Index）MCP伺服器，檢測環境並相應配置。

## Overview

LCI可以兩種方式登錄：
1. **Via slop-mcp** — 集中管理，含搜索、發現、編排
2. **Via standard mcp.json** — 直接配置於Claude Code設置

MCP伺服器命令：本地 `lci` binary（`~/.local/bin/lci`、`/usr/local/bin/lci`或PATH中）。無則以 lci-cpp 安裝腳本裝之。

## Installation Flow

### Step 1: Detect Binary Location

先查lci是否本地安裝：

```bash
# Check common installation locations
for loc in "$HOME/.local/bin/lci" "/usr/local/bin/lci"; do
  if [ -x "$loc" ]; then
    echo "FOUND: $loc"
    "$loc" --version
    exit 0
  fi
done

# Check PATH
if command -v lci &> /dev/null; then
  echo "FOUND: $(which lci)"
  lci --version
else
  echo "NOT FOUND - install it: curl -fsSL https://raw.githubusercontent.com/standardbeagle/lci-cpp/main/install.sh | sh"
fi
```

**記錄結果**供登錄使用：
- 若找到：用完整路徑作命令
- 若未找到：先執行 `curl -fsSL https://raw.githubusercontent.com/standardbeagle/lci-cpp/main/install.sh | sh`（Windows：`irm https://raw.githubusercontent.com/standardbeagle/lci-cpp/main/install.ps1 | iex`），再用所得路徑

### Step 2: Detect slop-mcp Availability

查slop-mcp是否可用：

```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: { "action": "list" }
```

**若成功**（返回MCP列表）：slop-mcp可用，轉Step 3A
**若工具未找到或報錯**：slop-mcp不可用，轉Step 3B

### Step 3A: Install via slop-mcp

slop-mcp可用時，通過其登錄LCI以集中管理。

#### Check if Already Registered

在manage_mcps列表回應中查找"lci"。若已登錄，報告狀態，跳過登錄。

#### Ask User for Scope Preference

向用戶呈現範圍選項：

| Scope | Location | Use Case |
|-------|----------|----------|
| `user` | `~/.config/slop-mcp/config.kdl` | Personal setup, persists across projects |
| `project` | `.slop-mcp.kdl` | Team-shared, committed to repo |
| `memory` | Runtime only | Temporary, CI environments |

默認推薦：`user`用於持久個人安裝。

#### Register LCI

**若本地二進位存在：**
```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: {
  "action": "register",
  "name": "lci",
  "command": "<full-path-to-lci>",
  "args": ["mcp"],
  "scope": "<user's choice>"
}
```
注：使用完整路徑（如`/home/username/.local/bin/lci`或`/usr/local/bin/lci`）

#### Verify Registration

```
Call: mcp__plugin_slop-mcp_slop-mcp__search_tools
Parameters: { "query": "search", "mcp_name": "lci" }
```

若返回工具，登錄成功。

### Step 3B: Standard Installation (No slop-mcp)

slop-mcp不可用時，通過mcp.json配置。

#### Install LCI Binary

```bash
# Linux x86_64 / macOS arm64
curl -fsSL https://raw.githubusercontent.com/standardbeagle/lci-cpp/main/install.sh | sh
```

```powershell
# Windows x86_64
irm https://raw.githubusercontent.com/standardbeagle/lci-cpp/main/install.ps1 | iex
```

更新：`lci update`。

#### Configure mcp.json

添加至Claude Code `.mcp.json`（或創建）：

```json
{
  "lci": {
    "command": "lci",
    "args": ["mcp"]
  }
}
```

#### Verify Configuration

重啟Claude Code重加載MCP伺服器，測試：

```
Call: mcp__lci__info
Parameters: {}
```

## Post-Installation Verification

無論安裝方式，驗lci正常：

```
Call: mcp__lci__info
Parameters: { "tool": "search" }
```

應返回search工具信息。

## Quick Test

執行簡單搜索確認一切正常：

```
Call: mcp__lci__search
Parameters: { "pattern": "main", "max": 5 }
```

## Summary Output

設置後，向用戶提供：

1. **Binary location**：本地路徑
2. **Installation method used**：slop-mcp或標準mcp.json
3. **Scope**（若slop-mcp）：user/project/memory
4. **Verification status**：工具可用且正常
5. **Available tools**：現可訪問之lci工具列表
6. **Next steps**：建議運行`/lci:search-code`或`/lci:explore-codebase`技藝
