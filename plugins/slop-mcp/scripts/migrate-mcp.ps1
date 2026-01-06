#Requires -Version 5.1
<#
.SYNOPSIS
    Migrate MCP configurations to SLOP management.

.DESCRIPTION
    Migrates existing MCP server configurations from Claude Desktop, VS Code,
    Cursor, or custom config files to SLOP management.

.PARAMETER Source
    Configuration source: claude-desktop, vscode, cursor, auto, or path to config file.

.PARAMETER Exclude
    Server names to exclude from migration (comma-separated).

.PARAMETER SlopDir
    Custom SLOP directory path. Defaults to ~/slop-mcp.

.EXAMPLE
    .\migrate-mcp.ps1 claude-desktop

.EXAMPLE
    .\migrate-mcp.ps1 auto -Exclude "github,heavy-server"

.EXAMPLE
    .\migrate-mcp.ps1 "C:\custom\mcp-config.json"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$Source,

    [string]$Exclude = "",

    [string]$SlopDir = (Join-Path $env:USERPROFILE "slop-mcp")
)

$ErrorActionPreference = "Stop"

function Get-ClaudeDesktopConfigPath {
    $paths = @(
        (Join-Path $env:APPDATA "Claude\claude_desktop_config.json"),  # Windows
        (Join-Path $env:USERPROFILE ".config\claude\claude_desktop_config.json"),  # Linux-style
        (Join-Path $env:USERPROFILE "Library\Application Support\Claude\claude_desktop_config.json")  # macOS
    )
    foreach ($path in $paths) {
        if (Test-Path $path) { return $path }
    }
    return $null
}

function Get-VSCodeConfigPath {
    $paths = @(
        (Join-Path (Get-Location) ".vscode\mcp.json"),
        (Join-Path (Get-Location) "mcp.json")
    )
    foreach ($path in $paths) {
        if (Test-Path $path) { return $path }
    }
    return $null
}

function Get-CursorConfigPath {
    $path = Join-Path $env:USERPROFILE ".cursor\mcp.json"
    if (Test-Path $path) { return $path }
    return $null
}

function Load-MCPConfig([string]$source) {
    $path = $null

    switch ($source) {
        "claude-desktop" {
            $path = Get-ClaudeDesktopConfigPath
            if (-not $path) { throw "Claude Desktop config not found" }
        }
        "vscode" {
            $path = Get-VSCodeConfigPath
            if (-not $path) { throw "VS Code MCP config not found" }
        }
        "cursor" {
            $path = Get-CursorConfigPath
            if (-not $path) { throw "Cursor config not found" }
        }
        "auto" {
            foreach ($src in @("claude-desktop", "vscode", "cursor")) {
                try {
                    return Load-MCPConfig $src
                }
                catch {
                    continue
                }
            }
            throw "No MCP config found"
        }
        default {
            $path = $source
            if (-not (Test-Path $path)) {
                throw "Config file not found: $source"
            }
        }
    }

    $config = Get-Content $path -Raw | ConvertFrom-Json
    return @{ Path = $path; Config = $config }
}

function Parse-Servers($config) {
    $servers = @()

    # Claude Desktop format
    if ($config.mcpServers) {
        foreach ($name in $config.mcpServers.PSObject.Properties.Name) {
            $server = $config.mcpServers.$name
            $servers += @{
                name = $name
                command = $server.command
                args = @($server.args)
                env = if ($server.env) { $server.env } else { @{} }
                enabled = $true
            }
        }
    }
    # VS Code format
    elseif ($config.servers) {
        foreach ($name in $config.servers.PSObject.Properties.Name) {
            $server = $config.servers.$name
            $servers += @{
                name = $name
                command = $server.command
                args = @($server.args)
                env = if ($server.env) { $server.env } else { @{} }
                enabled = $true
            }
        }
    }

    return $servers
}

function Backup-Config([string]$sourcePath, [string]$slopDir) {
    $migrationsDir = Join-Path $slopDir "migrations"
    if (-not (Test-Path $migrationsDir)) {
        New-Item -ItemType Directory -Path $migrationsDir -Force | Out-Null
    }

    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($sourcePath)
    $extension = [System.IO.Path]::GetExtension($sourcePath)
    $backupName = "$fileName-$timestamp$extension"
    $backupPath = Join-Path $migrationsDir $backupName

    Copy-Item -Path $sourcePath -Destination $backupPath
    return $backupPath
}

function Load-SlopConfig([string]$slopDir) {
    $configPath = Join-Path $slopDir "config\slop.yaml"
    if (Test-Path $configPath) {
        # Simple YAML parsing for servers array
        $content = Get-Content $configPath -Raw
        # For now, return basic structure - full YAML parsing would need module
        return @{
            version = "1.0"
            servers = @()
        }
    }
    return @{
        version = "1.0"
        servers = @()
    }
}

function Save-SlopConfig([string]$slopDir, [hashtable]$config) {
    $configPath = Join-Path $slopDir "config\slop.yaml"
    $configDir = Split-Path $configPath -Parent
    if (-not (Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    }

    $yaml = @"
version: "$($config.version)"

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
"@

    foreach ($server in $config.servers) {
        $yaml += "`n  - name: $($server.name)"
        $yaml += "`n    command: $($server.command)"
        if ($server.args -and $server.args.Count -gt 0) {
            $argsJson = ($server.args | ForEach-Object { "`"$_`"" }) -join ", "
            $yaml += "`n    args: [$argsJson]"
        } else {
            $yaml += "`n    args: []"
        }
        $yaml += "`n    env: {}"
        $yaml += "`n    enabled: $($server.enabled.ToString().ToLower())"
    }

    if ($config.servers.Count -eq 0) {
        $yaml += " []"
    }

    $yaml += @"

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

    Set-Content -Path $configPath -Value $yaml -Encoding UTF8
}

function Migrate-Config([string]$source, [string]$slopDir, [string[]]$excludeList) {
    # Load source config
    $sourceData = Load-MCPConfig $source
    $sourcePath = $sourceData.Path
    $sourceConfig = $sourceData.Config

    # Backup
    $backupPath = Backup-Config $sourcePath $slopDir

    # Parse servers
    $servers = Parse-Servers $sourceConfig

    # Filter excluded
    if ($excludeList -and $excludeList.Count -gt 0) {
        $servers = $servers | Where-Object { $excludeList -notcontains $_.name }
    }

    # Load existing SLOP config
    $slopConfig = Load-SlopConfig $slopDir

    # Get existing server names
    $existingNames = @($slopConfig.servers | ForEach-Object { $_.name })

    # Add new servers
    $added = @()
    $skipped = @()
    foreach ($server in $servers) {
        if ($existingNames -contains $server.name) {
            $skipped += $server.name
        }
        else {
            $slopConfig.servers += $server
            $added += $server.name
        }
    }

    # Save updated config
    Save-SlopConfig $slopDir $slopConfig

    return @{
        source = $sourcePath
        backup = $backupPath
        added = $added
        skipped = $skipped
        total = $servers.Count
    }
}

# Main execution
$excludeList = if ($Exclude) { $Exclude -split "," | ForEach-Object { $_.Trim() } } else { @() }

try {
    $result = Migrate-Config $Source $SlopDir $excludeList

    Write-Host "Migration complete!"
    Write-Host "  Source: $($result.source)"
    Write-Host "  Backup: $($result.backup)"
    Write-Host "  Added: $($result.added.Count) servers"
    if ($result.added.Count -gt 0) {
        foreach ($name in $result.added) {
            Write-Host "    - $name"
        }
    }
    if ($result.skipped.Count -gt 0) {
        Write-Host "  Skipped (already exists): $($result.skipped.Count)"
        foreach ($name in $result.skipped) {
            Write-Host "    - $name"
        }
    }
}
catch {
    Write-Error "Migration failed: $_"
    exit 1
}
