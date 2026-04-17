---
name: slop-init
description: Check slop-mcp status, display registered MCP servers, and show quick-start guidance. 查 slop-mcp 狀態，顯示已注冊服務器，提供快速入門指引。 Use when: starting a new session, verifying slop-mcp is working, onboarding to the plugin.
---

# Initialize slop-mcp

查 slop-mcp 當前狀態並顯示已注冊 MCP 服務器。

## Steps

1. 以 `action: "list"` 調用 `manage_mcps`，取所有已注冊 MCP 服務器。
2. 報告結果：已注冊服務器數量、名稱及連接狀態。
3. 若無已注冊服務器，解釋如何添加。

## Tool Call

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "list"
```

## Configuration

slop-mcp 以 KDL 格式在兩域存持久配置：

- **User scope**: `~/.config/slop-mcp/config.kdl` -- 全項目適用
- **Project scope**: `.slop-mcp.kdl` 在項目根 -- 僅本項目適用
- **Memory scope**: 僅運行時，slop-mcp 重啟後丟失

Example KDL config:

```kdl
mcp "filesystem" {
  command "npx"
  args "-y" "@modelcontextprotocol/server-filesystem" "/home/user"
}

mcp "lci" {
  command "npx"
  args "-y" "@standardbeagle/lci@latest" "mcp"
}
```

## After Init

- 用 `/slop-add` 注冊新 MCP 服務器
- 用 `/slop-migrate` 導入現有 Claude Code MCP 配置
- 用 `/slop-list` 查詳細服務器信息
- 用 `/slop-search` 跨所有服務器查找工具
