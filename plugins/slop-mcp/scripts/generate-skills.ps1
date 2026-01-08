<#
.SYNOPSIS
Generate skills for SLOP-managed MCP servers.

.DESCRIPTION
Creates two types of skills:
1. Tool reference skills - Lists all tools from an MCP with usage examples
2. Activity skills - Task-oriented skills for common workflows

.PARAMETER Server
The MCP server name to generate skills for.

.PARAMETER All
Generate tool reference skills for all SLOP-managed servers.

.PARAMETER Activities
Enable interactive mode for creating activity skills.

.PARAMETER SlopUrl
SLOP server URL (default: http://localhost:8080)

.EXAMPLE
.\generate-skills.ps1 -Server figma
Generate tool reference for figma MCP

.EXAMPLE
.\generate-skills.ps1 -All
Generate tool references for all MCPs

.EXAMPLE
.\generate-skills.ps1 -Server figma -Activities
Interactive activity skill creation for figma
#>

param(
    [Parameter(Position = 0)]
    [string]$Server,

    [switch]$All,

    [switch]$Activities,

    [string]$SlopUrl = $env:SLOP_URL ?? "http://localhost:8080"
)

$ErrorActionPreference = "Stop"
$SkillsDir = Join-Path $HOME "slop-mcp" "skills"

function Get-SlopServers {
    try {
        $response = Invoke-RestMethod -Uri "$SlopUrl/info" -TimeoutSec 10
        return $response.servers
    }
    catch {
        Write-Error "Error connecting to SLOP server at $SlopUrl : $_"
        Write-Host "Make sure SLOP is running: slop serve"
        exit 1
    }
}

function Get-SlopTools {
    param([string]$ServerName)

    $url = "$SlopUrl/tools"
    if ($ServerName) {
        $url += "?server=$ServerName"
    }

    try {
        $response = Invoke-RestMethod -Uri $url -TimeoutSec 10
        if ($response -is [array]) {
            return $response
        }
        return $response.tools ?? @()
    }
    catch {
        Write-Warning "Error fetching tools: $_"
        return @()
    }
}

function Get-ExampleValue {
    param(
        [string]$ParamName,
        [string]$ParamType
    )

    $patterns = @{
        "nodeId"      = '"1:2"'
        "fileKey"     = '"abc123xyz"'
        "path"        = '"/path/to/file"'
        "file_path"   = '"/path/to/file"'
        "pattern"     = '"*.ts"'
        "query"       = '"search term"'
        "url"         = '"https://example.com"'
        "id"          = '"123"'
        "name"        = '"example"'
        "message"     = '"Your message here"'
        "content"     = '"Content here"'
        "title"       = '"Title here"'
        "description" = '"Description here"'
    }

    foreach ($key in $patterns.Keys) {
        if ($ParamName -like "*$key*") {
            return $patterns[$key]
        }
    }

    $typeExamples = @{
        "string"  = '"value"'
        "number"  = "42"
        "integer" = "42"
        "boolean" = "true"
        "array"   = '["item1", "item2"]'
        "object"  = '{"key": "value"}'
    }

    return $typeExamples[$ParamType] ?? '"value"'
}

function New-ToolSkillContent {
    param(
        [string]$ServerName,
        [array]$Tools
    )

    $displayName = (Get-Culture).TextInfo.ToTitleCase($ServerName.Replace('-', ' '))

    $content = @"
---
name: $ServerName-tools
description: Tool reference for $ServerName MCP - lists all tools and how to call them
---

# $displayName MCP Tools Reference

Quick reference for all tools provided by the **$ServerName** MCP server.

## How to Use These Tools

Call any tool using the ``/slop-exec`` command:

``````bash
/slop-exec $ServerName.<tool_name> --param1 "value" --param2 "value"
``````

Or via REST API:

``````bash
curl -X POST http://localhost:8080/tools/$ServerName.<tool_name> \
  -H "Content-Type: application/json" \
  -d '{"param1": "value", "param2": "value"}'
``````

---

## Available Tools


"@

    foreach ($tool in $Tools) {
        $name = $tool.name ?? "unknown"
        $desc = $tool.description ?? "No description available"
        $inputSchema = $tool.inputSchema ?? @{}
        $params = $inputSchema.properties ?? @{}
        $required = $inputSchema.required ?? @()

        $content += "### ``$name```n`n"
        $content += "$desc`n`n"

        if ($params.Count -gt 0) {
            $content += "**Parameters:**`n`n"
            $content += "| Parameter | Required | Type | Description |`n"
            $content += "|-----------|----------|------|-------------|`n"

            foreach ($paramName in $params.Keys) {
                $paramInfo = $params[$paramName]
                $req = if ($required -contains $paramName) { "Yes" } else { "No" }
                $paramType = $paramInfo.type ?? "string"
                $paramDesc = ($paramInfo.description ?? "-").Replace("|", "\|")
                $content += "| ``$paramName`` | $req | $paramType | $paramDesc |`n"
            }
            $content += "`n"
        }

        # Generate usage example
        $content += "**Usage:**`n`n``````bash`n"
        $content += "/slop-exec $ServerName.$name"

        if ($params.Count -gt 0) {
            $requiredParams = $params.Keys | Where-Object { $required -contains $_ }
            $optionalParams = ($params.Keys | Where-Object { $required -notcontains $_ }) | Select-Object -First 2

            foreach ($param in $requiredParams) {
                $paramType = $params[$param].type ?? "string"
                $exampleValue = Get-ExampleValue -ParamName $param -ParamType $paramType
                $content += " ```n  --$param $exampleValue"
            }

            if ($optionalParams) {
                $content += " ```n  # Optional:"
                foreach ($param in $optionalParams) {
                    $paramType = $params[$param].type ?? "string"
                    $exampleValue = Get-ExampleValue -ParamName $param -ParamType $paramType
                    $content += " --$param $exampleValue"
                }
            }
        }

        $content += "`n``````n`n---`n`n"
    }

    # Add quick reference table
    $content += "## Quick Reference Table`n`n"
    $content += "| Tool | Description |`n"
    $content += "|------|-------------|`n"

    foreach ($tool in $Tools) {
        $name = $tool.name ?? "unknown"
        $desc = $tool.description ?? "No description"
        if ($desc.Length -gt 60) {
            $desc = $desc.Substring(0, 57) + "..."
        }
        $desc = $desc.Replace("|", "\|").Replace("`n", " ")
        $content += "| ``$name`` | $desc |`n"
    }

    $content += "`n"

    return $content
}

function Get-ActivitySuggestions {
    param(
        [string]$ServerName,
        [array]$Tools
    )

    $suggestions = @()
    $toolNames = $Tools | ForEach-Object { ($_.name ?? "").ToLower() }
    $toolDescs = ($Tools | ForEach-Object { $_.description ?? "" }) -join " "

    # Figma-related
    if ($ServerName -like "*figma*" -or $toolDescs -like "*design*") {
        $suggestions += @(
            @{name = "create-component"; desc = "Create a code component from a Figma design" }
            @{name = "extract-styles"; desc = "Extract design tokens and CSS variables from Figma" }
            @{name = "sync-design"; desc = "Sync design changes to existing code components" }
            @{name = "screenshot-component"; desc = "Capture screenshots of Figma components" }
        )
    }

    # GitHub-related
    if ($ServerName -like "*github*" -or ($toolNames | Where-Object { $_ -like "*issue*" -or $_ -like "*pr*" -or $_ -like "*pull*" })) {
        $suggestions += @(
            @{name = "create-pr"; desc = "Create pull request with standard template" }
            @{name = "review-pr"; desc = "Review and comment on pull requests" }
            @{name = "manage-issues"; desc = "Batch create, update, or close issues" }
            @{name = "sync-labels"; desc = "Synchronize labels across repositories" }
        )
    }

    # Filesystem-related
    if ($ServerName -like "*filesystem*" -or ($toolNames | Where-Object { $_ -like "*read*" -or $_ -like "*write*" -or $_ -like "*file*" })) {
        $suggestions += @(
            @{name = "batch-rename"; desc = "Rename multiple files with patterns" }
            @{name = "find-replace"; desc = "Find and replace text across files" }
            @{name = "organize-files"; desc = "Organize files by type, date, or custom rules" }
        )
    }

    # Code search/analysis
    if ($ServerName -like "*lci*" -or $toolDescs -like "*search*") {
        $suggestions += @(
            @{name = "find-usages"; desc = "Find all usages of a function or symbol" }
            @{name = "analyze-dependencies"; desc = "Analyze code dependencies" }
            @{name = "find-dead-code"; desc = "Find unused functions and exports" }
        )
    }

    # Generic suggestions if no specific matches
    if ($suggestions.Count -eq 0) {
        $suggestions += @(
            @{name = "batch-operation"; desc = "Run operations on multiple items" }
            @{name = "generate-report"; desc = "Generate a summary report" }
            @{name = "validate-data"; desc = "Validate data against rules" }
        )
    }

    return $suggestions
}

function New-ActivitySkillContent {
    param(
        [string]$ServerName,
        [string]$ActivityName,
        [string]$ActivityDesc,
        [array]$Tools
    )

    $displayName = (Get-Culture).TextInfo.ToTitleCase($ActivityName.Replace('-', ' '))

    $content = @"
---
name: $ServerName-$ActivityName
description: $ActivityDesc using $ServerName MCP
---

# $displayName

$ActivityDesc

## Prerequisites

- SLOP server running with **$ServerName** MCP enabled
- Required credentials/tokens configured in environment

## Overview

This activity combines multiple $ServerName tools to accomplish:
$($ActivityDesc.ToLower())

## Steps

### 1. Preparation

Before starting, ensure you have:
- [ ] SLOP server running
- [ ] $ServerName MCP enabled and healthy
- [ ] Required inputs ready

### 2. Execute Main Action

``````bash
# Primary tool call
/slop-exec $ServerName.<tool_name> --param "value"
``````

### 3. Verify Results

``````bash
# Verification tool call
/slop-exec $ServerName.<verification_tool> --param "value"
``````

## Available Tools for This Activity

The following tools from $ServerName are relevant:


"@

    $relevantTools = $Tools | Select-Object -First 5
    foreach ($tool in $relevantTools) {
        $name = $tool.name ?? "unknown"
        $desc = $tool.description ?? "No description"
        if ($desc.Length -gt 80) {
            $desc = $desc.Substring(0, 77) + "..."
        }
        $content += "- ``$name`` - $desc`n"
    }

    $content += @"

## Variations

### Quick Mode
For simple cases, use minimal options:
``````bash
/slop-exec $ServerName.<tool> --essential-param "value"
``````

### Detailed Mode
For comprehensive results, include all options:
``````bash
/slop-exec $ServerName.<tool> --param1 "value" --param2 "value" --verbose true
``````

## Troubleshooting

### Tool Not Found
Ensure the server is running:
``````bash
curl http://localhost:8080/info
``````

### Permission Errors
Check credentials are set in environment variables.

### Timeout Errors
Increase timeout in SLOP config or retry with smaller inputs.

## Related Skills

- ``$ServerName-tools`` - Full tool reference

"@

    return $content
}

function Save-Skill {
    param(
        [string]$Filename,
        [string]$Content
    )

    if (-not (Test-Path $SkillsDir)) {
        New-Item -ItemType Directory -Path $SkillsDir -Force | Out-Null
    }

    $path = Join-Path $SkillsDir $Filename
    $Content | Out-File -FilePath $path -Encoding utf8 -NoNewline
    return $path
}

function Start-InteractiveActivities {
    param(
        [string]$ServerName,
        [array]$Tools
    )

    $suggestions = Get-ActivitySuggestions -ServerName $ServerName -Tools $Tools

    Write-Host "`n$('='*60)"
    Write-Host "Activity Skill Generator for: $ServerName"
    Write-Host "$('='*60)`n"

    Write-Host "Suggested activities based on available tools:`n"
    for ($i = 0; $i -lt $suggestions.Count; $i++) {
        Write-Host "  $($i + 1). $($suggestions[$i].name) - $($suggestions[$i].desc)"
    }

    Write-Host "`n  $($suggestions.Count + 1). [Custom] Create your own activity"
    Write-Host "  0. Done`n"

    while ($true) {
        $choice = Read-Host "Select activity to create (number)"
        if ($choice -eq "0") { break }

        if ($choice -eq "$($suggestions.Count + 1)") {
            $name = Read-Host "Activity name (kebab-case)"
            $desc = Read-Host "Activity description"
            if (-not $name -or -not $desc) {
                Write-Host "Name and description required."
                continue
            }
        }
        else {
            $idx = [int]$choice - 1
            if ($idx -lt 0 -or $idx -ge $suggestions.Count) {
                Write-Host "Invalid selection."
                continue
            }
            $name = $suggestions[$idx].name
            $desc = $suggestions[$idx].desc
        }

        $content = New-ActivitySkillContent -ServerName $ServerName -ActivityName $name -ActivityDesc $desc -Tools $Tools
        $filename = "$ServerName-$name.md"
        $path = Save-Skill -Filename $filename -Content $content
        Write-Host "  Created: $path`n"
    }
}

# Main execution
if ($All) {
    $servers = Get-SlopServers
    if (-not $servers) {
        Write-Error "No servers found. Is SLOP running?"
        exit 1
    }

    Write-Host "Generating tool reference skills for $($servers.Count) servers...`n"
    foreach ($server in $servers) {
        $name = if ($server -is [hashtable] -or $server.PSObject) { $server.name ?? $server } else { $server }
        $tools = Get-SlopTools -ServerName $name
        if ($tools -and $tools.Count -gt 0) {
            $content = New-ToolSkillContent -ServerName $name -Tools $tools
            $path = Save-Skill -Filename "$name-tools.md" -Content $content
            Write-Host "  Created: $path ($($tools.Count) tools)"
        }
        else {
            Write-Host "  Skipped: $name (no tools found)"
        }
    }
}
elseif ($Server) {
    $tools = Get-SlopTools -ServerName $Server
    if (-not $tools -or $tools.Count -eq 0) {
        Write-Error "No tools found for server: $Server"
        Write-Host "Available servers:"
        foreach ($s in Get-SlopServers) {
            $name = if ($s -is [hashtable] -or $s.PSObject) { $s.name ?? $s } else { $s }
            Write-Host "  - $name"
        }
        exit 1
    }

    # Generate tool reference skill
    $content = New-ToolSkillContent -ServerName $Server -Tools $tools
    $path = Save-Skill -Filename "$Server-tools.md" -Content $content
    Write-Host "Created tool reference: $path ($($tools.Count) tools)"

    # Interactive activity creation
    if ($Activities) {
        Start-InteractiveActivities -ServerName $Server -Tools $tools
    }
}
else {
    Write-Host @"
Generate skills for SLOP-managed MCP servers.

Usage:
    .\generate-skills.ps1 -Server <name>           Generate tool reference
    .\generate-skills.ps1 -All                     Generate for all servers
    .\generate-skills.ps1 -Server <name> -Activities  Interactive activity creation

Examples:
    .\generate-skills.ps1 -Server figma
    .\generate-skills.ps1 -All
    .\generate-skills.ps1 -Server figma -Activities
"@
    exit 1
}
