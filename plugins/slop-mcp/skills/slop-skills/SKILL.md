---
name: slop-mcp-slop-skills
description: "\"Generate markdown tool reference skill files for slop-mcp managed MCP servers. 為 slop-mcp 管理之 MCP 服務器生成工具參考技藝文件。 Use when: documenting a new MCP server, generating usage examples, creating skill files for all registered servers.\""
disable-model-invocation: true
---

# Generate MCP Skills

為 slop-mcp 管理之 MCP 服務器創建工具參考技藝，記錄所有可用工具、參數及用例。

## Steps

### 1. List Available Servers

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "list"
```

若用戶指定服務器名則用之。若 `--all`，為每個服務器生成。

### 2. Get Tool Metadata

取目標服務器所有工具及完整 schema：

```
mcp__plugin_slop-mcp_slop-mcp__get_metadata
  mcp_name: "<server-name>"
  verbose: true
```

### 3. Generate Skill File

在 `plugins/slop-mcp/skills/<server-name>-tools.md` 創建 markdown 技藝文件，結構如下：

```markdown
---
name: <server-name>-tools
description: Tool reference for <server-name> MCP server
---

# <Server Name> MCP Tools Reference

## Tools

### <tool_name>
**Description:** <from metadata>

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| param1 | string | yes | ... |
| param2 | number | no | ... |

**Example:**
\```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
  mcp_name: "<server-name>"
  tool_name: "<tool_name>"
  parameters: { "param1": "value" }
\```
```

### 4. Report Results

告知用戶已生成哪些技藝文件及其保存位置。

## Usage

```
/slop-skills <server-name>     # Generate for one server
/slop-skills --all             # Generate for all servers
```
