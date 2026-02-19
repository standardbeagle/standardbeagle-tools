---
name: slop-skills
description: Generate tool reference skills for slop-mcp managed MCP servers
---

# Generate MCP Skills

Create tool reference skills for MCP servers managed by slop-mcp. These skills document all available tools with their parameters and usage examples.

## Steps

### 1. List Available Servers

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "list"
```

If user specifies a server name, use that. If `--all`, generate for every server.

### 2. Get Tool Metadata

For the target server, fetch all tools with full schemas:

```
mcp__plugin_slop-mcp_slop-mcp__get_metadata
  mcp_name: "<server-name>"
  verbose: true
```

### 3. Generate Skill File

Create a markdown skill file at `plugins/slop-mcp/skills/<server-name>-tools.md` with this structure:

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

Tell the user which skill files were generated and where they are saved.

## Usage

```
/slop-skills <server-name>     # Generate for one server
/slop-skills --all             # Generate for all servers
```
