---
name: mcp-tester-add-server
description: "\"Dynamically add MCP server to debug proxy for testing. 動態添MCP伺服器入除錯代理。 Use when: add mcp server, connect new server, register mcp for testing, attach server to proxy, test new mcp\""
disable-model-invocation: true
arguments: " - name: server-name description: Name to identify this server (used as tool prefix) required: true - name: command description: Command to launch the MCP server required: true"
---

# Add MCP Server to Debug Proxy

動態加入新 MCP 伺服器至 mcp-debug 代理供測試與開發。

## Instructions

1. 以 `mcp-debug` MCP 伺服器之 `server_add` 工具，傳入：
   - `name`：用戶提供之伺服器名（{{server-name}}）
   - `command`：啟動伺服器之命令（{{command}}）

2. 加入後以 `server_list` 確認成功，並顯示可用工具。

3. 向用戶報告：
   - 伺服器名及其工具所用前綴
   - 伺服器當前所有可用工具（均以伺服器名為前綴）
   - 任何連線錯誤或問題

## Example Usage

```
/add-server myserver "npx @modelcontextprotocol/filesystem /home/user"
```

此命令將加入 filesystem MCP 伺服器，工具以 `myserver_read_file`、`myserver_write_file` 等前綴命名。
