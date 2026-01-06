#Requires -Version 5.1
<#
.SYNOPSIS
    Initialize ~/slop-mcp directory structure for SLOP MCP management.

.DESCRIPTION
    Creates the SLOP directory structure with default configuration files
    and helper scripts for managing MCP servers.

.PARAMETER Force
    Reinitialize even if directory exists (backs up existing config).

.PARAMETER SlopDir
    Custom SLOP directory path. Defaults to ~/slop-mcp.

.EXAMPLE
    .\init-slop.ps1

.EXAMPLE
    .\init-slop.ps1 -Force

.EXAMPLE
    .\init-slop.ps1 -SlopDir "C:\slop-mcp"
#>

[CmdletBinding()]
param(
    [switch]$Force,
    [string]$SlopDir = (Join-Path $env:USERPROFILE "slop-mcp")
)

$ErrorActionPreference = "Stop"

# Check if already exists
if ((Test-Path $SlopDir) -and -not $Force) {
    Write-Error "Error: $SlopDir already exists. Use -Force to reinitialize (will backup existing config)"
    exit 1
}

# Backup existing if force
if ((Test-Path $SlopDir) -and $Force) {
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $backupDir = "$SlopDir.backup.$timestamp"
    Write-Host "Backing up existing config to $backupDir"
    Move-Item -Path $SlopDir -Destination $backupDir
}

# Create directory structure
Write-Host "Creating SLOP directory structure..."
$dirs = @(
    (Join-Path $SlopDir "config/servers"),
    (Join-Path $SlopDir "scripts"),
    (Join-Path $SlopDir "migrations"),
    (Join-Path $SlopDir "cache"),
    (Join-Path $SlopDir "logs")
)

foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}

# Create default configuration
$configPath = Join-Path $SlopDir "config/slop.yaml"
$configContent = @"
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
"@
Set-Content -Path $configPath -Value $configContent -Encoding UTF8

# Create start script
$startScript = Join-Path $SlopDir "scripts/Start-Slop.ps1"
$startContent = @'
#Requires -Version 5.1
<#
.SYNOPSIS
    Start SLOP proxy server.
#>

$SlopDir = if ($env:SLOP_DIR) { $env:SLOP_DIR } else { Join-Path $env:USERPROFILE "slop-mcp" }
$ConfigPath = Join-Path $SlopDir "config/slop.yaml"
$PidFile = Join-Path $SlopDir "cache/slop.pid"

if (Test-Path $PidFile) {
    $pid = Get-Content $PidFile
    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "SLOP is already running (PID: $pid)"
        exit 0
    }
}

Write-Host "Starting SLOP proxy..."
# Note: Replace with actual SLOP command when available
# $process = Start-Process -FilePath "slop" -ArgumentList "serve", "--config", $ConfigPath -PassThru -NoNewWindow
# Set-Content -Path $PidFile -Value $process.Id

Write-Host "SLOP started (config: $ConfigPath)"
'@
Set-Content -Path $startScript -Value $startContent -Encoding UTF8

# Create stop script
$stopScript = Join-Path $SlopDir "scripts/Stop-Slop.ps1"
$stopContent = @'
#Requires -Version 5.1
<#
.SYNOPSIS
    Stop SLOP proxy server.
#>

$SlopDir = if ($env:SLOP_DIR) { $env:SLOP_DIR } else { Join-Path $env:USERPROFILE "slop-mcp" }
$PidFile = Join-Path $SlopDir "cache/slop.pid"

if (-not (Test-Path $PidFile)) {
    Write-Host "SLOP is not running (no PID file)"
    exit 0
}

$pid = Get-Content $PidFile
$process = Get-Process -Id $pid -ErrorAction SilentlyContinue

if ($process) {
    Write-Host "Stopping SLOP (PID: $pid)..."
    Stop-Process -Id $pid -Force
    Remove-Item -Path $PidFile -Force
    Write-Host "SLOP stopped"
} else {
    Write-Host "SLOP process not found, cleaning up PID file"
    Remove-Item -Path $PidFile -Force
}
'@
Set-Content -Path $stopScript -Value $stopContent -Encoding UTF8

# Create status script
$statusScript = Join-Path $SlopDir "scripts/Get-SlopStatus.ps1"
$statusContent = @'
#Requires -Version 5.1
<#
.SYNOPSIS
    Check SLOP proxy status.
#>

$SlopDir = if ($env:SLOP_DIR) { $env:SLOP_DIR } else { Join-Path $env:USERPROFILE "slop-mcp" }
$PidFile = Join-Path $SlopDir "cache/slop.pid"
$ConfigPath = Join-Path $SlopDir "config/slop.yaml"

Write-Host "SLOP Status"
Write-Host "==========="
Write-Host "Directory: $SlopDir"

if (Test-Path $PidFile) {
    $pid = Get-Content $PidFile
    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "Status: Running (PID: $pid)"
    } else {
        Write-Host "Status: Stopped (stale PID file)"
    }
} else {
    Write-Host "Status: Stopped"
}

# Check config
if (Test-Path $ConfigPath) {
    Write-Host ""
    Write-Host "Configuration:"
    $config = Get-Content $ConfigPath -Raw
    if ($config -match "host:\s*(.+)") { Write-Host "  host: $($Matches[1])" }
    if ($config -match "port:\s*(\d+)") { Write-Host "  port: $($Matches[1])" }

    $serverCount = ([regex]::Matches($config, "^\s*-\s*name:", [System.Text.RegularExpressions.RegexOptions]::Multiline)).Count
    Write-Host "  servers: $serverCount"
}
'@
Set-Content -Path $statusScript -Value $statusContent -Encoding UTF8

Write-Host ""
Write-Host "SLOP initialized successfully!"
Write-Host ""
Write-Host "Directory structure:"
Write-Host "  $SlopDir\"
Write-Host "  +-- config\          # Configuration files"
Write-Host "  |   +-- slop.yaml    # Main configuration"
Write-Host "  |   +-- servers\     # Individual server configs"
Write-Host "  +-- scripts\         # Helper scripts"
Write-Host "  +-- migrations\      # Migration backups"
Write-Host "  +-- cache\           # Runtime cache"
Write-Host "  +-- logs\            # Log files"
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Add MCP servers: /slop-add <server-command>"
Write-Host "  2. Migrate existing: /slop-migrate claude-desktop"
Write-Host "  3. List servers: /slop-list"
