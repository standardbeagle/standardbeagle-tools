---
name: slop-init
description: Initialize ~/slop-mcp directory structure and configuration
---

# Initialize SLOP MCP Environment

Set up the ~/slop-mcp directory structure for managing MCP servers through SLOP.

## Directory Structure to Create

```
~/slop-mcp/
├── config/
│   ├── slop.yaml           # Main SLOP configuration
│   └── servers/            # Individual MCP server configs
├── scripts/                # Automation scripts
├── migrations/             # Migration history and backups
├── cache/                  # Tool/resource cache
└── logs/                   # Server and proxy logs
```

## Actions

1. Check if ~/slop-mcp already exists
2. Create directory structure
3. Generate default slop.yaml configuration:

```yaml
# ~/slop-mcp/config/slop.yaml
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

servers: []  # MCP servers to manage

logging:
  level: info
  file: ~/slop-mcp/logs/slop.log
```

4. Create helper scripts in ~/slop-mcp/scripts/:
   - start.sh - Start SLOP proxy
   - stop.sh - Stop SLOP proxy
   - status.sh - Check server status

5. Report success and next steps

## Usage

```
/slop-init [--force]
```

Options:
- `--force`: Reinitialize even if directory exists (backs up existing config)
