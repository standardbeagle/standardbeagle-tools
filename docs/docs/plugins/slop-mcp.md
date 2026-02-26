---
title: slop-mcp - MCP Server Management Plugin for Claude Code
description: Unified MCP server management with SLOP (Scriptable Language for Orchestrating Processes). Install, configure, and manage all your MCP servers.
keywords: [Claude Code MCP, MCP server management, SLOP, Model Context Protocol, server orchestration, MCP configuration]
sidebar_position: 8
---

# slop-mcp - MCP Server Management

**slop-mcp** provides unified MCP server management using SLOP (Scriptable Language for Orchestrating Processes). Install, configure, and manage all your Model Context Protocol servers from one place.

## Why slop-mcp?

:::tip Unified MCP Management
Manage all your MCP servers through a single, scriptable interface. No more scattered configurations across multiple tools.
:::

### Key Features

- **📦 Server Registration**: Register MCP servers from multiple sources
- **🔧 Configuration Management**: Centralized configuration storage
- **🔍 Tool Search**: Search tools across all registered servers
- **⚡ Script Execution**: Execute SLOP scripts for complex workflows
- **🔄 Migration Support**: Migrate existing MCP configurations

## Installation

```bash
# Install from marketplace
claude mcp add-dir https://github.com/standardbeagle/standardbeagle-tools
claude mcp add slop-mcp --source ./plugins/slop-mcp
```

## Available Skills

| Skill | Description |
|-------|-------------|
| `slop-init` | Initialize ~/slop-mcp directory structure |
| `slop-migrate` | Migrate existing MCP configurations to SLOP |
| `slop-add` | Add an MCP server to SLOP management |
| `slop-list` | List all MCP servers managed by SLOP |
| `slop-search` | Search tools and resources across all servers |
| `slop-exec` | Execute an MCP tool through SLOP |
| `slop-skills` | Generate skills for SLOP-managed servers |

## Usage Examples

### Initialize SLOP

```bash
# Initialize SLOP directory
/slop-init

# Force reinitialize (backs up existing)
/slop-init --force
```

### Add MCP Servers

```bash
# Add from NPM
/slop-add @modelcontextprotocol/server-filesystem

# Add from GitHub
/slop-add github:modelcontextprotocol/servers --path filesystem

# Add local server
/slop-add ./my-mcp-server
```

### List Servers

```bash
# List all registered servers
/slop-list
```

### Search Tools

```bash
# Search for tools across all servers
/slop-search "file"

# Search in specific server
/slop-search "read" --server filesystem
```

### Execute Tools

```bash
# Execute a tool
/slop-exec filesystem read_file --path "/src/index.ts"
```

### Generate Skills

```bash
# Generate skills for all servers
/slop-skills

# Generate for specific server
/slop-skills --server filesystem
```

## Directory Structure

```
~/slop-mcp/
├── config/
│   ├── slop.yaml          # Main configuration
│   └── servers/           # Individual server configs
├── scripts/               # Helper scripts
│   ├── start.sh
│   ├── stop.sh
│   └── status.sh
├── migrations/            # Migration backups
├── cache/                 # Runtime cache
│   └── memory.json        # Persistent memory
└── logs/                  # Log files
```

## Configuration

### Main Configuration (slop.yaml)

```yaml
version: "1.0"

host: localhost
port: 8080

endpoints:
  chat: /chat
  tools: /tools
  memory: /memory
  resources: /resources
  pay: /pay
  info: /info

servers: []

memory:
  backend: file
  path: ~/slop-mcp/cache/memory.json

logging:
  level: info
  file: ~/slop-mcp/logs/slop.log
  format: text

security:
  cors: true
  allowed_origins:
    - http://localhost:*
```

### Server Registration

Servers are registered in `config/servers/`:

```yaml
# config/servers/filesystem.yaml
name: filesystem
transport: stdio
command: npx
args:
  - "-y"
  - "@modelcontextprotocol/server-filesystem"
  - "/path/to/project"
env: {}
```

## SLOP Scripting

SLOP provides a scripting language for orchestrating MCP tools:

### Basic Execution

```javascript
// Execute a tool
result = mcp.filesystem.read_file(path: "/src/index.ts")
emit(result)
```

### Chaining Results

```javascript
// Chain tool results
data = api.fetch(id: 42)
summary = ai.summarize(text: data["content"])
emit(summary)
```

### Loops and Collections

```javascript
// Process multiple items
results = []
for id in [1, 2, 3]:
    results = results + [api.get(id: id)]
emit(items: results, count: len(results))
```

### Built-in Functions

```javascript
// Transform data
repos = github.search(query: "mcp")
names = map(repos, |r| r["name"])
emit(join(names, "\n"))

// Filter collections
[1, 2, 3, 4, 5] | filter(|x| x > 2) | map(|x| x * 10)
```

### Memory Persistence

```javascript
// Session memory (persists across runs)
store_set("key", value)
prev = store_get("key")

// Persistent memory (survives restarts)
mem_save("bank", "key", value)
data = mem_load("bank", "key")
```

## Migration Support

### From Claude Desktop

```bash
# Migrate Claude Desktop config
/slop-migrate claude-desktop
```

### From VS Code

```bash
# Migrate VS Code MCP settings
/slop-migrate vscode
```

### From Custom Config

```bash
# Migrate from custom path
/slop-migrate /path/to/config.json
```

## MCP Tools

slop-mcp provides these MCP tools:

| Tool | Description |
|------|-------------|
| `manage_mcps` | Register, unregister, list MCP servers |
| `get_metadata` | Get tool schemas and descriptions |
| `execute_tool` | Execute a tool on a specific MCP |
| `search_tools` | Search tools by name/description |
| `run_slop` | Execute SLOP scripts |
| `auth_mcp` | OAuth authentication for MCP servers |

## Troubleshooting

### Server Not Connecting

```bash
# Check server status
/slop-list

# Verify command is correct
npx -y @modelcontextprotocol/server-filesystem --help
```

### Tool Not Found

1. Verify server is registered: `/slop-list`
2. Check tool exists: `/slop-search "tool-name"`
3. Refresh metadata: Restart SLOP

### Migration Issues

```bash
# Check migration backup
ls ~/slop-mcp/migrations/

# Restore from backup
cp ~/slop-mcp/migrations/backup-timestamp/* ~/slop-mcp/config/
```

## Related Resources

- [MCP Specification](https://modelcontextprotocol.io/specification)
- [SLOP Documentation](https://github.com/standardbeagle/slop-mcp)
- [MCP Server Registry](https://github.com/modelcontextprotocol/servers)

## Version History

| Version | Changes |
|---------|---------|
| 0.1.0 | Initial release with server management, SLOP scripting, and migration support |
