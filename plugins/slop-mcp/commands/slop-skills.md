---
name: slop-skills
description: Generate skills for SLOP-managed MCP servers - tool reference skills and activity skills
---

# Generate MCP Skills

This command creates two types of skills for SLOP-managed MCP servers:

1. **Tool Reference Skills** - Lists all tools from an MCP server with usage examples
2. **Activity Skills** - Task-oriented skills combining multiple tools for common workflows

## Usage

```bash
# Generate tool reference skill for a specific MCP
/slop-skills <server-name>

# Generate tool reference skills for all SLOP-managed MCPs
/slop-skills --all

# Interactive mode - prompts for activity skills to create
/slop-skills <server-name> --activities
```

## What You Need To Do

### Step 1: Discover Available MCP Servers

First, list all SLOP-managed MCP servers to find available servers:

```bash
# Using SLOP REST API
curl -s http://localhost:8080/info | jq '.servers'

# Or check the config directly
cat ~/slop-mcp/config/slop.yaml
```

### Step 2: Get Tools for the Target MCP

For the requested server, fetch all available tools:

```bash
# List tools for a specific server
curl -s "http://localhost:8080/tools?server=<server-name>" | jq '.'

# Or list all tools across all servers
curl -s http://localhost:8080/tools | jq '.'
```

### Step 3: Generate Tool Reference Skill

Create a skill file at `~/slop-mcp/skills/<server-name>-tools.md` with this structure:

```markdown
---
name: <server-name>-tools
description: Tool reference for <server-name> MCP - lists all tools and how to call them
---

# <Server Name> MCP Tools Reference

Quick reference for all tools provided by the <server-name> MCP server.

## Available Tools

### tool_name_1
**Description:** <tool description from MCP>

**Parameters:**
- `param1` (required): <description>
- `param2` (optional): <description>

**Usage:**
```bash
/slop-exec <server-name>.tool_name_1 --param1 "value"
```

**Example:**
```bash
/slop-exec <server-name>.tool_name_1 --param1 "example value"
```

### tool_name_2
...

## Quick Reference Table

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| tool_name_1 | Brief description | param1, param2 |
| tool_name_2 | Brief description | paramA |

## Common Workflows

### Workflow 1: <Common Task>
```bash
# Step 1: ...
/slop-exec <server-name>.tool1 --param "value"

# Step 2: ...
/slop-exec <server-name>.tool2 --param "value"
```
```

### Step 4: Prompt for Activity Skills (if --activities flag)

Ask the user what activity skills they want to create. Suggest relevant activities based on the MCP's capabilities:

**For Figma MCP, suggest:**
- `create-component` - Create a new UI component from design
- `extract-styles` - Extract design tokens and styles
- `sync-design` - Sync design changes to code
- `screenshot-component` - Capture component screenshots

**For GitHub MCP, suggest:**
- `create-pr` - Create pull request with template
- `review-pr` - Review and comment on PR
- `manage-issues` - Batch issue management
- `sync-labels` - Synchronize labels across repos

**For Filesystem MCP, suggest:**
- `batch-rename` - Rename multiple files
- `find-replace` - Find and replace across files
- `organize-files` - Organize files by type/date

### Step 5: Generate Activity Skills

For each requested activity skill, create a file at `~/slop-mcp/skills/<server-name>-<activity>.md`:

```markdown
---
name: <server-name>-<activity>
description: <Activity description> using <server-name> MCP
---

# <Activity Title>

<Detailed description of what this activity accomplishes>

## Prerequisites

- SLOP server running with <server-name> MCP enabled
- <Any other requirements>

## Steps

### 1. <First Step>
<Explanation>
```bash
/slop-exec <server-name>.tool1 --param "value"
```

### 2. <Second Step>
<Explanation>
```bash
/slop-exec <server-name>.tool2 --param "value"
```

## Variations

### <Variation 1>
<How to adapt for different use case>

### <Variation 2>
<How to adapt for different use case>

## Troubleshooting

### <Common Issue>
<Solution>
```

### Step 6: Register Skills in Plugin

After generating skills, add them to `~/slop-mcp/skills/` and inform the user they can be used.

## Example: Figma MCP

If user runs `/slop-skills figma`, generate:

**1. Tool Reference (`figma-tools.md`):**
```markdown
---
name: figma-tools
description: Tool reference for Figma MCP - lists all tools and how to call them
---

# Figma MCP Tools Reference

## Available Tools

### get_design_context
**Description:** Generate UI code for a given Figma node

**Parameters:**
- `nodeId` (required): Node ID in format "123:456" or "123-456"
- `fileKey` (required): Figma file key from URL
- `clientLanguages` (optional): Programming languages (e.g., "typescript")
- `clientFrameworks` (optional): Frameworks (e.g., "react")

**Usage:**
```bash
/slop-exec figma.get_design_context --nodeId "1:2" --fileKey "abc123"
```

### get_screenshot
**Description:** Generate a screenshot for a given Figma node

**Parameters:**
- `nodeId` (required): Node ID
- `fileKey` (required): Figma file key

**Usage:**
```bash
/slop-exec figma.get_screenshot --nodeId "1:2" --fileKey "abc123"
```

### get_metadata
**Description:** Get metadata for a node in XML format

...
```

**2. Activity Skill (`figma-create-component.md`):**
```markdown
---
name: figma-create-component
description: Create a code component from a Figma design
---

# Create Component from Figma

Generate production-ready code for a UI component from a Figma design.

## Prerequisites

- Figma file URL with node ID
- Target framework (React, Vue, etc.)

## Steps

### 1. Get Design Context
Extract the design structure and generate initial code:
```bash
/slop-exec figma.get_design_context \
  --nodeId "1:2" \
  --fileKey "abc123" \
  --clientFrameworks "react" \
  --clientLanguages "typescript"
```

### 2. Get Screenshot for Reference
Capture a visual reference:
```bash
/slop-exec figma.get_screenshot --nodeId "1:2" --fileKey "abc123"
```

### 3. Extract Variables (Optional)
Get design tokens if the component uses variables:
```bash
/slop-exec figma.get_variable_defs --nodeId "1:2" --fileKey "abc123"
```

## Output

The generated code will include:
- Component structure
- Styling (CSS/Tailwind/styled-components based on framework)
- Asset download URLs for images/icons
```

## Automation Script

For batch generation, you can use this script:

```python
#!/usr/bin/env python3
"""Generate skills for SLOP-managed MCP servers."""

import json
import os
import requests
from pathlib import Path

SLOP_URL = "http://localhost:8080"
SKILLS_DIR = Path.home() / "slop-mcp" / "skills"

def get_servers():
    """Get list of SLOP-managed servers."""
    resp = requests.get(f"{SLOP_URL}/info")
    return resp.json().get("servers", [])

def get_tools(server_name=None):
    """Get tools for a server or all servers."""
    url = f"{SLOP_URL}/tools"
    if server_name:
        url += f"?server={server_name}"
    resp = requests.get(url)
    return resp.json()

def generate_tool_skill(server_name, tools):
    """Generate tool reference skill for a server."""
    content = f"""---
name: {server_name}-tools
description: Tool reference for {server_name} MCP - lists all tools and how to call them
---

# {server_name.title()} MCP Tools Reference

Quick reference for all tools provided by the {server_name} MCP server.

## Available Tools

"""
    for tool in tools:
        name = tool.get("name", "unknown")
        desc = tool.get("description", "No description")
        params = tool.get("inputSchema", {}).get("properties", {})
        required = tool.get("inputSchema", {}).get("required", [])

        content += f"### {name}\n"
        content += f"**Description:** {desc}\n\n"

        if params:
            content += "**Parameters:**\n"
            for param_name, param_info in params.items():
                req = "(required)" if param_name in required else "(optional)"
                param_desc = param_info.get("description", "No description")
                content += f"- `{param_name}` {req}: {param_desc}\n"
            content += "\n"

        content += f"**Usage:**\n```bash\n/slop-exec {server_name}.{name}"
        if params:
            example_params = [f'--{p} "value"' for p in list(params.keys())[:2]]
            content += " " + " ".join(example_params)
        content += "\n```\n\n"

    return content

def save_skill(filename, content):
    """Save skill to file."""
    SKILLS_DIR.mkdir(parents=True, exist_ok=True)
    path = SKILLS_DIR / filename
    path.write_text(content)
    print(f"Created: {path}")

if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: generate-skills.py <server-name> [--all]")
        sys.exit(1)

    if sys.argv[1] == "--all":
        for server in get_servers():
            tools = get_tools(server["name"])
            content = generate_tool_skill(server["name"], tools)
            save_skill(f"{server['name']}-tools.md", content)
    else:
        server_name = sys.argv[1]
        tools = get_tools(server_name)
        content = generate_tool_skill(server_name, tools)
        save_skill(f"{server_name}-tools.md", content)
```

## Notes

- Generated skills are saved to `~/slop-mcp/skills/`
- Tool reference skills are named `<server>-tools.md`
- Activity skills are named `<server>-<activity>.md`
- Skills can be used directly with Claude Code once generated
- Re-run the command to update skills when MCP tools change
