---
name: test-server
description: Test an MCP server interactively using mcp-tui
argument-hint: "<server-command or config>"
---

# Test MCP Server

Launch an interactive testing session for an MCP server using mcp-tui.

## Process

### 1. Determine Server Connection

Ask user for connection method:
- **STDIO**: Local process command (e.g., `npx @modelcontextprotocol/server-everything stdio`)
- **SSE**: Server-Sent Events URL (e.g., `http://localhost:8000/sse`)
- **HTTP**: Standard HTTP endpoint
- **Config file**: Path to MCP config file

### 2. Launch Interactive TUI

```bash
# For STDIO server
mcp-tui "npx -y <server-package> stdio"

# For SSE server
mcp-tui --url http://localhost:8000/sse

# For config file
mcp-tui --config /path/to/config.json
```

### 3. Guide Through Testing

In the TUI:
1. **Tools Tab**: Browse and test available tools
2. **Resources Tab**: Explore server resources
3. **Prompts Tab**: Test prompt templates
4. **Execute**: Run tools with form-guided inputs

### 4. Document Results

After testing, summarize:
- Tools discovered and their functionality
- Any errors or unexpected behaviors
- Performance observations
- Recommendations for the server

## Usage

```
/mcp-tester:test-server npx -y @modelcontextprotocol/server-filesystem stdio /tmp
/mcp-tester:test-server --url http://localhost:3000/sse
/mcp-tester:test-server --config ~/.config/claude/config.json
```

## CLI Mode for Automation

For scripted testing:
```bash
# List all tools
mcp-tui --porcelain -f json tool list

# Call a specific tool
mcp-tui tool call <tool-name> param1="value1" param2="value2"

# List resources
mcp-tui resource list
```
