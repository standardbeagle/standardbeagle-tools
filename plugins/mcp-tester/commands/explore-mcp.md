---
name: explore-mcp
description: Explore and document an MCP server's capabilities
argument-hint: "<server-command or url>"
---

# Explore MCP Server

Discover and document all capabilities of an MCP server including tools, resources, and prompts.

## Process

### 1. Connect to Server

```bash
# STDIO server
mcp-tui "npx -y <package> stdio"

# SSE server
mcp-tui --url http://localhost:8000/sse

# From config
mcp-tui --config ~/.config/claude/config.json
```

### 2. List All Capabilities

```bash
# List tools with full details
mcp-tui --porcelain -f json tool list

# List resources
mcp-tui --porcelain -f json resource list

# List prompts
mcp-tui --porcelain -f json prompt list
```

### 3. Generate Documentation

For each tool discovered:
- Name and description
- Input schema (parameters)
- Example usage
- Return type

### 4. Test Key Tools

For each tool:
```bash
mcp-tui tool call <tool-name> param="value"
```

Document:
- Expected behavior
- Edge cases
- Error handling

## Usage

```
/mcp-tester:explore-mcp npx -y @modelcontextprotocol/server-everything stdio
/mcp-tester:explore-mcp --url http://localhost:3000/sse
```

## Output Format

Generate a markdown document:

```markdown
# MCP Server: [name]

## Tools

### tool_name
**Description**: What the tool does

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| param1 | string | yes | Description |
| param2 | number | no | Description |

**Example**:
\`\`\`
mcp-tui tool call tool_name param1="value"
\`\`\`

**Response**: Description of typical response

---

## Resources

### resource://path
**Description**: What the resource provides
**MIME Type**: application/json

---

## Prompts

### prompt_name
**Description**: What the prompt does
**Arguments**: arg1, arg2
```

## Automation

For CI/CD integration:
```bash
# Export capabilities as JSON
mcp-tui --porcelain -f json tool list > tools.json
mcp-tui --porcelain -f json resource list > resources.json

# Validate expected tools exist
jq -e '.[] | select(.name == "expected_tool")' tools.json
```
