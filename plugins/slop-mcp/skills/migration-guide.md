---
name: migration-guide
description: Migrate MCP server configs from Claude Desktop, VS Code, Cursor, or Claude Code into slop-mcp KDL management. 將現有 MCP 配置遷移至 slop-mcp 管理之指南。 Use when: importing existing MCP servers, switching to slop-mcp, consolidating multi-client configs.
---

# MCP to slop-mcp Migration Guide

將現有 MCP 服務器配置從 Claude Desktop、VS Code 或其他客戶端遷移至 slop-mcp 管理，以 KDL 格式存儲。

## Why Migrate to slop-mcp?

1. **統一工具發現** -- 以 `search_tools` 跨所有 MCP 服務器搜索
2. **動態管理** -- 運行時注冊卸載服務器，無需重啟 Claude Code
3. **SLOP 腳本** -- 以 SLOP 語言通過 `run_slop` 自動化多工具工作流
4. **域控制** -- 用戶級、項目級或僅內存配置
5. **KDL 配置** -- 比散落 JSON 文件更整潔之格式

## Migration Sources

### Claude Desktop

Location:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Linux: `~/.config/claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

Format:
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"],
      "env": {}
    }
  }
}
```

### VS Code

Location: `.vscode/mcp.json` or workspace settings

### Claude Code Settings

Location: `~/.claude/settings.json` (mcpServers section)

### Cursor

Location: `~/.cursor/mcp.json`

## Migration Steps

### Step 1: Check Current State

調用 `manage_mcps` 查看已注冊服務器：

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "list"
```

### Step 2: Read Source Config

讀取源配置文件（如 Claude Desktop config），解析各 `mcpServers` 條目。

### Step 3: Register Each Server

對源配置中每個服務器，以 `action: "register"` 調用 `manage_mcps`：

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "register"
  name: "filesystem"
  type: "command"
  command: "npx"
  args: ["-y", "@modelcontextprotocol/server-filesystem", "/path"]
  env: {}
  scope: "user"
```

### Step 4: Choose Scope

- **user** -- `~/.config/slop-mcp/config.kdl` -- 全處可用
- **project** -- `.slop-mcp.kdl` -- 僅限本項目
- **memory** -- 先測試再持久化

### Step 5: Verify

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "list"
```

確認所有服務器出現且已連接。

### Step 6: Test a Tool

```
mcp__plugin_slop-mcp_slop-mcp__search_tools
  query: "read"
```

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "filesystem"
  tool_name: "read_file"
  parameters: { "path": "/etc/hostname" }
```

## KDL Config Format

以 `scope: "user"` 遷移後，`~/.config/slop-mcp/config.kdl` 如下：

```kdl
mcp "filesystem" {
  command "npx"
  args "-y" "@modelcontextprotocol/server-filesystem" "/home/user"
}

mcp "lci" {
  command "npx"
  args "-y" "@standardbeagle/lci@latest" "mcp"
}

mcp "github" {
  command "npx"
  args "-y" "@modelcontextprotocol/server-github"
  env {
    GITHUB_TOKEN "${GITHUB_TOKEN}"
  }
}
```

## Troubleshooting

### Server Won't Connect
- 驗證命令存在：`which npx`
- 在終端直接運行命令試之
- 以 `action: "status"` 及服務器名調用 `manage_mcps`

### Duplicate Server Name
- 若名稱已存在，`manage_mcps` 拒絕注冊
- 先用 `action: "unregister"` 卸載，再重新注冊

### Environment Variables
- 注冊時在 `env` 參數中傳入環境變量
- 密鑰在 shell 環境中設置，KDL 配置中引用

### Rollback
- 卸載服務器：以 `action: "unregister"` 及服務器名調用 `manage_mcps`
- 刪除 KDL 配置文件以移除所有持久注冊
- 原始配置文件永不修改
