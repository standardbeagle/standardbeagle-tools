#!/bin/bash
# init-slop.sh - Initialize ~/slop-mcp directory structure

set -e

SLOP_DIR="${SLOP_DIR:-$HOME/slop-mcp}"
FORCE="${1:-}"

# Check if already exists
if [ -d "$SLOP_DIR" ] && [ "$FORCE" != "--force" ]; then
    echo "Error: $SLOP_DIR already exists"
    echo "Use --force to reinitialize (will backup existing config)"
    exit 1
fi

# Backup existing if force
if [ -d "$SLOP_DIR" ] && [ "$FORCE" = "--force" ]; then
    BACKUP="$SLOP_DIR.backup.$(date +%Y%m%d%H%M%S)"
    echo "Backing up existing config to $BACKUP"
    mv "$SLOP_DIR" "$BACKUP"
fi

# Create directory structure
echo "Creating SLOP directory structure..."
mkdir -p "$SLOP_DIR"/{config/servers,scripts,migrations,cache,logs}

# Create default configuration
cat > "$SLOP_DIR/config/slop.yaml" << 'EOF'
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

# Managed MCP servers (add servers with /slop-add)
servers: []

# Memory settings
memory:
  backend: file
  path: ~/slop-mcp/cache/memory.json

# Logging
logging:
  level: info
  file: ~/slop-mcp/logs/slop.log
  format: text

# Security
security:
  cors: true
  allowed_origins:
    - http://localhost:*
EOF

# Create start script
cat > "$SLOP_DIR/scripts/start.sh" << 'EOF'
#!/bin/bash
# Start SLOP proxy server

SLOP_DIR="${SLOP_DIR:-$HOME/slop-mcp}"
CONFIG="$SLOP_DIR/config/slop.yaml"
PIDFILE="$SLOP_DIR/cache/slop.pid"

if [ -f "$PIDFILE" ]; then
    PID=$(cat "$PIDFILE")
    if kill -0 "$PID" 2>/dev/null; then
        echo "SLOP is already running (PID: $PID)"
        exit 0
    fi
fi

echo "Starting SLOP proxy..."
# Note: Replace with actual SLOP command when available
# slop serve --config "$CONFIG" &
# echo $! > "$PIDFILE"

echo "SLOP started (config: $CONFIG)"
EOF
chmod +x "$SLOP_DIR/scripts/start.sh"

# Create stop script
cat > "$SLOP_DIR/scripts/stop.sh" << 'EOF'
#!/bin/bash
# Stop SLOP proxy server

SLOP_DIR="${SLOP_DIR:-$HOME/slop-mcp}"
PIDFILE="$SLOP_DIR/cache/slop.pid"

if [ ! -f "$PIDFILE" ]; then
    echo "SLOP is not running (no PID file)"
    exit 0
fi

PID=$(cat "$PIDFILE")
if kill -0 "$PID" 2>/dev/null; then
    echo "Stopping SLOP (PID: $PID)..."
    kill "$PID"
    rm -f "$PIDFILE"
    echo "SLOP stopped"
else
    echo "SLOP process not found, cleaning up PID file"
    rm -f "$PIDFILE"
fi
EOF
chmod +x "$SLOP_DIR/scripts/stop.sh"

# Create status script
cat > "$SLOP_DIR/scripts/status.sh" << 'EOF'
#!/bin/bash
# Check SLOP proxy status

SLOP_DIR="${SLOP_DIR:-$HOME/slop-mcp}"
PIDFILE="$SLOP_DIR/cache/slop.pid"

echo "SLOP Status"
echo "==========="
echo "Directory: $SLOP_DIR"

if [ -f "$PIDFILE" ]; then
    PID=$(cat "$PIDFILE")
    if kill -0 "$PID" 2>/dev/null; then
        echo "Status: Running (PID: $PID)"
    else
        echo "Status: Stopped (stale PID file)"
    fi
else
    echo "Status: Stopped"
fi

# Check config
if [ -f "$SLOP_DIR/config/slop.yaml" ]; then
    echo ""
    echo "Configuration:"
    grep -E "^(host|port):" "$SLOP_DIR/config/slop.yaml" | sed 's/^/  /'

    SERVER_COUNT=$(grep -c "^  - name:" "$SLOP_DIR/config/slop.yaml" 2>/dev/null || echo "0")
    echo "  servers: $SERVER_COUNT"
fi
EOF
chmod +x "$SLOP_DIR/scripts/status.sh"

echo ""
echo "SLOP initialized successfully!"
echo ""
echo "Directory structure:"
echo "  $SLOP_DIR/"
echo "  ├── config/          # Configuration files"
echo "  │   ├── slop.yaml    # Main configuration"
echo "  │   └── servers/     # Individual server configs"
echo "  ├── scripts/         # Helper scripts"
echo "  ├── migrations/      # Migration backups"
echo "  ├── cache/           # Runtime cache"
echo "  └── logs/            # Log files"
echo ""
echo "Next steps:"
echo "  1. Add MCP servers: /slop-add <server-command>"
echo "  2. Migrate existing: /slop-migrate claude-desktop"
echo "  3. List servers: /slop-list"
