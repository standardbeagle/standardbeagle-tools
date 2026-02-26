#!/usr/bin/env node
/**
 * init-slop.js - Initialize ~/slop-mcp directory structure
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const SLOP_DIR = process.env.SLOP_DIR || path.join(os.homedir(), 'slop-mcp');
const FORCE = process.argv[2] || '';

// Check if already exists
if (fs.existsSync(SLOP_DIR) && FORCE !== '--force') {
  console.log(`Error: ${SLOP_DIR} already exists`);
  console.log('Use --force to reinitialize (will backup existing config)');
  process.exit(1);
}

// Backup existing if force
if (fs.existsSync(SLOP_DIR) && FORCE === '--force') {
  const backup = `${SLOP_DIR}.backup.${Date.now()}`;
  console.log(`Backing up existing config to ${backup}`);
  fs.renameSync(SLOP_DIR, backup);
}

// Create directory structure
console.log('Creating SLOP directory structure...');
const dirs = [
  SLOP_DIR,
  path.join(SLOP_DIR, 'config'),
  path.join(SLOP_DIR, 'config', 'servers'),
  path.join(SLOP_DIR, 'scripts'),
  path.join(SLOP_DIR, 'migrations'),
  path.join(SLOP_DIR, 'cache'),
  path.join(SLOP_DIR, 'logs')
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Create default configuration
const slopConfig = `version: "1.0"

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
`;

fs.writeFileSync(path.join(SLOP_DIR, 'config', 'slop.yaml'), slopConfig);

// Create start script
const startScript = `#!/bin/bash
# Start SLOP proxy server

SLOP_DIR="\${SLOP_DIR:-$HOME/slop-mcp}"
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
`;

const startScriptPath = path.join(SLOP_DIR, 'scripts', 'start.sh');
fs.writeFileSync(startScriptPath, startScript);
fs.chmodSync(startScriptPath, 0o755);

// Create stop script
const stopScript = `#!/bin/bash
# Stop SLOP proxy server

SLOP_DIR="\${SLOP_DIR:-$HOME/slop-mcp}"
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
`;

const stopScriptPath = path.join(SLOP_DIR, 'scripts', 'stop.sh');
fs.writeFileSync(stopScriptPath, stopScript);
fs.chmodSync(stopScriptPath, 0o755);

// Create status script
const statusScript = `#!/bin/bash
# Check SLOP proxy status

SLOP_DIR="\${SLOP_DIR:-$HOME/slop-mcp}"
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
`;

const statusScriptPath = path.join(SLOP_DIR, 'scripts', 'status.sh');
fs.writeFileSync(statusScriptPath, statusScript);
fs.chmodSync(statusScriptPath, 0o755);

console.log('');
console.log('SLOP initialized successfully!');
console.log('');
console.log('Directory structure:');
console.log(`  ${SLOP_DIR}/`);
console.log('  ├── config/          # Configuration files');
console.log('  │   ├── slop.yaml    # Main configuration');
console.log('  │   └── servers/     # Individual server configs');
console.log('  ├── scripts/         # Helper scripts');
console.log('  ├── migrations/      # Migration backups');
console.log('  ├── cache/           # Runtime cache');
console.log('  └── logs/            # Log files');
console.log('');
console.log('Next steps:');
console.log('  1. Add MCP servers: /slop-add <server-command>');
console.log('  2. Migrate existing: /slop-migrate claude-desktop');
console.log('  3. List servers: /slop-list');

process.exit(0);
