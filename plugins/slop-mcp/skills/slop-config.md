---
name: slop-config
description: KDL config reference for slop-mcp scopes, manage_mcps params, auth, metadata. 配置格式、範圍、認證、元數據之參考。 Use when: registering servers, inspecting auth, understanding KDL format, checking scope behavior.
---

# slop-mcp Configuration Reference

slop-mcp 以 KDL 格式存持久配置，分兩域。

## Config File Locations

| Scope | File | Purpose |
|-------|------|---------|
| User | `~/.config/slop-mcp/config.kdl` | 通用於所有項目 |
| Project | `.slop-mcp.kdl` (project root) | 僅限本項目 |

項目域配置疊加用戶域。同名 MCP 服務器，項目域優先。

## KDL Config Format

### Command-based MCP Server

```kdl
mcp "server-name" {
  command "npx"
  args "-y" "@namespace/package@latest" "mcp"
}
```

### Command with Environment Variables

```kdl
mcp "github" {
  command "npx"
  args "-y" "@modelcontextprotocol/server-github"
  env {
    GITHUB_TOKEN "${GITHUB_TOKEN}"
  }
}
```

### Local Binary

```kdl
mcp "my-server" {
  command "/usr/local/bin/my-mcp-server"
  args "--port" "3000"
}
```

### SSE or Streamable HTTP

```kdl
mcp "remote" type="sse" {
  url "https://mcp.example.com/sse"
}

mcp "streamable" type="streamable" {
  url "https://mcp.example.com/mcp"
}
```

### Dynamic Server (always re-fetch tools)

```kdl
mcp "evolving-server" dynamic=true {
  command "npx"
  args "-y" "@namespace/package@latest" "mcp"
}
```

## manage_mcps Parameters

`manage_mcps` 工具為服務器管理程序接口。

### Register

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "register"
  name: "server-name"        # required, unique identifier
  type: "command"             # "command" (default), "sse", "streamable"
  command: "npx"              # executable (for command type)
  args: ["-y", "pkg", "mcp"] # command arguments
  url: "https://..."          # server URL (for sse/streamable)
  env: { "KEY": "val" }       # environment variables
  headers: { "K": "V" }      # HTTP headers (for sse/streamable)
  scope: "user"               # "memory" (default), "user", "project"
  dynamic: false              # true to always re-fetch tool list
```

### Unregister

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "unregister"
  name: "server-name"
```

### Reconnect

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "reconnect"
  name: "server-name"
```

### List All

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "list"
```

### Status of One

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "status"
  name: "server-name"
```

## Authentication

OAuth 所需服務器，執行登錄：

```
mcp__plugin_slop-mcp_slop-mcp__auth_mcp
  action: "login"
  name: "server-name"
```

查驗認證狀態：

```
mcp__plugin_slop-mcp_slop-mcp__auth_mcp
  action: "status"
  name: "server-name"
```

列所有已認證服務器：

```
mcp__plugin_slop-mcp_slop-mcp__auth_mcp
  action: "list"
```

## Metadata Inspection

取服務器工具元數據：

```
mcp__plugin_slop-mcp_slop-mcp__get_metadata
  mcp_name: "server-name"          # optional: filter to one server
  tool_name: "tool-name"           # optional: filter to one tool
  verbose: true                    # include full input schemas
  file_path: "/tmp/metadata.json"  # optional: write to file
```

## Scope Behavior

- **memory**: 僅存當次 slop-mcp 會話，宜用於測試。
- **user**: 寫入 `~/.config/slop-mcp/config.kdl`，重啟存，全項目可用。
- **project**: 寫入當前目錄之 `.slop-mcp.kdl`，重啟存，僅本項目可用。

啟動時三域合併。用 `manage_mcps` `action: "list"` 觀合併結果。
