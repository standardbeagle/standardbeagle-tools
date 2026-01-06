---
name: slop-config
description: SLOP configuration reference and best practices
---

# SLOP Configuration Reference

Complete reference for configuring SLOP and managed MCP servers.

## Configuration Files

### Main Config: ~/slop-mcp/config/slop.yaml

```yaml
version: "1.0"

# SLOP server settings
host: localhost
port: 8080

# API endpoints
endpoints:
  chat: /chat
  tools: /tools
  memory: /memory
  resources: /resources
  pay: /pay
  info: /info

# Managed MCP servers
servers:
  - name: filesystem
    command: npx
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/home/user"]
    env: {}
    enabled: true
    timeout: 30000

  - name: lci
    command: npx
    args: ["-y", "@standardbeagle/lci@latest", "mcp"]
    env: {}
    enabled: true

# Memory settings (for /memory endpoint)
memory:
  backend: file  # file, redis, sqlite
  path: ~/slop-mcp/cache/memory.json

# Logging
logging:
  level: info
  file: ~/slop-mcp/logs/slop.log
  format: json  # json, text

# Security
security:
  cors: true
  allowed_origins:
    - http://localhost:*
    - https://*.example.com
```

### Server Config: ~/slop-mcp/config/servers/<name>.yaml

Individual server configurations for complex setups:

```yaml
name: my-custom-server
command: /usr/local/bin/my-server
args:
  - --port
  - "3000"
  - --config
  - /etc/my-server/config.yaml
env:
  API_KEY: "${MY_API_KEY}"
  DEBUG: "true"
enabled: true
timeout: 60000
retry:
  max_attempts: 3
  delay: 1000
healthcheck:
  interval: 30000
  endpoint: /health
```

## Environment Variables

SLOP supports environment variable substitution:

```yaml
env:
  GITHUB_TOKEN: "${GITHUB_TOKEN}"      # From environment
  API_KEY: "${API_KEY:-default}"       # With default value
  DEBUG: "${DEBUG:-false}"             # Boolean default
```

## Server Lifecycle

### Startup Modes

```yaml
servers:
  - name: always-on
    startup: immediate  # Start with SLOP

  - name: lazy
    startup: on-demand  # Start on first tool call

  - name: scheduled
    startup: cron
    schedule: "0 9 * * *"  # Start at 9 AM daily
```

### Health Checks

```yaml
healthcheck:
  enabled: true
  interval: 30000     # Check every 30s
  timeout: 5000       # 5s timeout
  retries: 3          # Restart after 3 failures
```

## Tool Routing

### Prefixes

By default, tools are prefixed with server name:
- `filesystem.read_file`
- `lci.search`

Override with:

```yaml
servers:
  - name: fs
    command: npx -y @modelcontextprotocol/server-filesystem /
    prefix: ""  # No prefix, use tool names directly
```

### Aliases

```yaml
aliases:
  read: filesystem.read_file
  search: lci.search
  find: lci.find_files
```

## Resource Routing

```yaml
resources:
  routing:
    "file://*": filesystem
    "repo://*": github
    "code://*": lci
```

## Memory Configuration

### File Backend (default)

```yaml
memory:
  backend: file
  path: ~/slop-mcp/cache/memory.json
  max_size: 100M
```

### SQLite Backend

```yaml
memory:
  backend: sqlite
  path: ~/slop-mcp/cache/memory.db
```

### Redis Backend

```yaml
memory:
  backend: redis
  url: redis://localhost:6379
  prefix: slop:
```

## Best Practices

1. **Use environment variables** for sensitive values
2. **Enable health checks** for production servers
3. **Set appropriate timeouts** based on tool complexity
4. **Use lazy startup** for infrequently used servers
5. **Configure logging** for debugging
6. **Backup configs** before making changes
