#Requires -Version 5.1
<#
.SYNOPSIS
    CLI client for SLOP REST API.

.DESCRIPTION
    PowerShell client for interacting with SLOP MCP management server.

.PARAMETER Command
    The command to execute: info, tools, call, resources, read, memory-get, memory-set

.PARAMETER Url
    SLOP server URL. Defaults to http://localhost:8080

.EXAMPLE
    .\slop-client.ps1 info

.EXAMPLE
    .\slop-client.ps1 tools -Query "search"

.EXAMPLE
    .\slop-client.ps1 call filesystem.read_file -Arguments @{path="/etc/hosts"}

.EXAMPLE
    .\slop-client.ps1 memory-set -Key "user_pref" -Value @{theme="dark"}
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true, Position=0)]
    [ValidateSet("info", "tools", "call", "resources", "read", "memory-get", "memory-set")]
    [string]$Command,

    [string]$Url = "http://localhost:8080",

    # For tools command
    [string]$Query,
    [string]$Server,

    # For call command
    [Parameter(Position=1)]
    [string]$Tool,
    [hashtable]$Arguments = @{},

    # For read command
    [string]$Uri,

    # For memory commands
    [string]$Key,
    [object]$Value,

    # Output format
    [switch]$Json
)

$ErrorActionPreference = "Stop"

class SlopClient {
    [string]$BaseUrl

    SlopClient([string]$baseUrl) {
        $this.BaseUrl = $baseUrl.TrimEnd("/")
    }

    [hashtable] Request([string]$method, [string]$endpoint, [hashtable]$data = $null) {
        $url = "$($this.BaseUrl)$endpoint"
        $headers = @{ "Content-Type" = "application/json" }

        $params = @{
            Uri = $url
            Method = $method
            Headers = $headers
            TimeoutSec = 30
        }

        if ($data) {
            $params.Body = ($data | ConvertTo-Json -Depth 10)
        }

        try {
            $response = Invoke-RestMethod @params
            return @{ result = $response }
        }
        catch {
            $statusCode = $_.Exception.Response.StatusCode.value__
            $errorMessage = $_.ErrorDetails.Message
            if ($errorMessage) {
                try {
                    return @{ error = ($errorMessage | ConvertFrom-Json) }
                }
                catch {
                    return @{ error = @{ code = $statusCode; message = $errorMessage } }
                }
            }
            return @{ error = @{ code = -1; message = $_.Exception.Message } }
        }
    }

    [hashtable] Info() {
        return $this.Request("GET", "/info")
    }

    [hashtable] ListTools([string]$query, [string]$server) {
        $params = @()
        if ($query) { $params += "q=$query" }
        if ($server) { $params += "server=$server" }
        $endpoint = "/tools"
        if ($params.Count -gt 0) { $endpoint += "?" + ($params -join "&") }
        return $this.Request("GET", $endpoint)
    }

    [hashtable] CallTool([string]$tool, [hashtable]$arguments) {
        return $this.Request("POST", "/tools", @{
            tool = $tool
            arguments = $arguments
        })
    }

    [hashtable] ListResources([string]$query) {
        $endpoint = "/resources"
        if ($query) { $endpoint += "?q=$query" }
        return $this.Request("GET", $endpoint)
    }

    [hashtable] ReadResource([string]$uri) {
        return $this.Request("POST", "/resources", @{ uri = $uri })
    }

    [hashtable] GetMemory([string]$key) {
        $endpoint = "/memory"
        if ($key) { $endpoint += "?key=$key" }
        return $this.Request("GET", $endpoint)
    }

    [hashtable] SetMemory([string]$key, [object]$value) {
        return $this.Request("POST", "/memory", @{
            key = $key
            value = $value
        })
    }
}

# Create client
$client = [SlopClient]::new($Url)

# Execute command
$result = switch ($Command) {
    "info" {
        $client.Info()
    }
    "tools" {
        $client.ListTools($Query, $Server)
    }
    "call" {
        if (-not $Tool) {
            Write-Error "Tool name required for 'call' command"
            exit 1
        }
        $client.CallTool($Tool, $Arguments)
    }
    "resources" {
        $client.ListResources($Query)
    }
    "read" {
        if (-not $Uri) {
            Write-Error "URI required for 'read' command"
            exit 1
        }
        $client.ReadResource($Uri)
    }
    "memory-get" {
        $client.GetMemory($Key)
    }
    "memory-set" {
        if (-not $Key) {
            Write-Error "Key required for 'memory-set' command"
            exit 1
        }
        $client.SetMemory($Key, $Value)
    }
}

# Output
if ($Json -or $result.error) {
    $result | ConvertTo-Json -Depth 10
}
else {
    switch ($Command) {
        "info" {
            Write-Host "SLOP Server: $Url"
            $data = $result.result
            if ($data.servers) {
                Write-Host "Servers: $($data.servers.Count)"
                foreach ($s in $data.servers) {
                    $status = if ($s.status -eq "running") { [char]0x2713 } else { [char]0x25CB }
                    Write-Host "  $status $($s.name)"
                }
            }
        }
        "tools" {
            $tools = $result.result.tools
            if (-not $tools) { $tools = @() }
            Write-Host "Tools ($($tools.Count)):"
            foreach ($tool in $tools) {
                Write-Host "  $($tool.name)"
                if ($tool.description) {
                    $desc = if ($tool.description.Length -gt 60) {
                        $tool.description.Substring(0, 60) + "..."
                    } else { $tool.description }
                    Write-Host "    $desc"
                }
            }
        }
        "call" {
            if ($result.result.result) {
                $result.result.result | ConvertTo-Json -Depth 10
            }
            else {
                $result | ConvertTo-Json -Depth 10
            }
        }
        "resources" {
            $resources = $result.result.resources
            if (-not $resources) { $resources = @() }
            Write-Host "Resources ($($resources.Count)):"
            foreach ($res in $resources) {
                Write-Host "  $($res.uri)"
            }
        }
        default {
            $result | ConvertTo-Json -Depth 10
        }
    }
}
