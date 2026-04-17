---
name: slop-migrate
description: Import existing MCP server configs from Claude Desktop, VS Code, or Claude Code settings into slop-mcp. 將現有 MCP 配置遷移至 slop-mcp 管理。 Use when: onboarding to slop-mcp, consolidating MCP registrations, importing from other clients.
---

# Migrate MCP Configurations to slop-mcp

讀取現有 Claude Code MCP 服務器配置並以 slop-mcp 注冊之。

## Steps

1. 讀取用戶現有 MCP 配置，檢查以下位置：
   - Claude Desktop: `~/.config/claude/claude_desktop_config.json` (Linux) or `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
   - VS Code: `.vscode/mcp.json`
   - Claude Code settings: `~/.claude/settings.json`
   - Project `.mcp.json`

2. 解析每個 `mcpServers` 條目，提取 name、command、args 及 env。

3. 以 `action: "list"` 調用 `manage_mcps`，查已注冊服務器。

4. 對每個尚未注冊之服務器，以 `action: "register"` 調用 `manage_mcps`：

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "register"
  name: "<server-name>"
  type: "command"
  command: "<command>"
  args: ["<arg1>", "<arg2>"]
  env: { "KEY": "value" }
  scope: "user"
```

5. 詢問用戶選擇域：
   - `"user"` -- 保存至 `~/.config/slop-mcp/config.kdl`，跨項目持久
   - `"project"` -- 保存至 `.slop-mcp.kdl`，僅本項目持久
   - `"memory"` -- 僅運行時，用於測試後確認

6. 報告結果：已遷移、已跳過（重複）及任何錯誤。

## Safety

- 跳過已注冊服務器（按名稱匹配）。
- 以錯誤消息報告注冊失敗之服務器。
- 不修改原始配置文件。
