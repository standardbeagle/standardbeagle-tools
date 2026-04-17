---
name: slop-add
description: Register a new MCP server with slop-mcp supporting command, SSE, streamable, or Python package types. 向 slop-mcp 注冊新 MCP 服務器，支持命令、SSE、streamable 及 Python 包類型。 Use when: adding a new MCP server, setting scope, configuring env vars or HTTP headers.
---

# Add MCP Server

以 `manage_mcps` 向 slop-mcp 注冊新 MCP 服務器。

## Tool Call

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "register"
  name: "<server-name>"
  type: "command"           # or "sse" or "streamable"
  command: "<executable>"   # for command type
  args: ["<arg1>", ...]     # command arguments
  url: "<server-url>"       # for sse/streamable types
  env: { "KEY": "value" }   # environment variables
  headers: { "K": "V" }    # HTTP headers (for sse/streamable)
  scope: "user"             # "memory" | "user" | "project"
  dynamic: false            # true to always re-fetch tool list
```

## Scope Options

- **memory** (default) -- 僅運行時，重啟後丟失，宜用於測試。
- **user** -- 保存至 `~/.config/slop-mcp/config.kdl`，跨項目持久。
- **project** -- 保存至項目根 `.slop-mcp.kdl`，本項目持久。

## Examples

詢問用戶服務器詳情後注冊，常見模式：

**NPX package:**
```
name: "filesystem"
command: "npx"
args: ["-y", "@modelcontextprotocol/server-filesystem", "/home/user"]
scope: "user"
```

**Local binary:**
```
name: "my-server"
command: "/usr/local/bin/my-mcp-server"
args: ["mcp"]
scope: "project"
```

**SSE server:**
```
name: "remote-server"
type: "sse"
url: "https://mcp.example.com/sse"
headers: { "Authorization": "Bearer token" }
scope: "user"
```

**Python package:**
```
name: "my-python-mcp"
command: "uvx"
args: ["my-mcp-package"]
scope: "user"
```

## After Adding

- 用 `/slop-list` 確認服務器已注冊
- 用 `/slop-search` 查其工具
- 用 `/slop-exec` 執行工具
