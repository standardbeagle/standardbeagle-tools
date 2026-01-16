#!/usr/bin/env python3
"""
Generate skills for SLOP-managed MCP servers.

Creates two types of skills:
1. Tool reference skills - Lists all tools from an MCP with usage examples
2. Activity skills - Task-oriented skills for common workflows

Usage:
    python generate-skills.py <server-name>           # Generate tool reference
    python generate-skills.py --all                   # Generate for all servers
    python generate-skills.py <server-name> --activities  # Interactive activity creation
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any

try:
    import requests
except ImportError:
    print("Error: requests library required. Install with: pip install requests")
    sys.exit(1)

SLOP_URL = os.environ.get("SLOP_URL", "http://localhost:8080")
SKILLS_DIR = Path.home() / "slop-mcp" / "skills"


def get_servers() -> list[dict[str, Any]]:
    """Get list of SLOP-managed servers."""
    try:
        resp = requests.get(f"{SLOP_URL}/info", timeout=10)
        resp.raise_for_status()
        return resp.json().get("servers", [])
    except requests.RequestException as e:
        print(f"Error connecting to SLOP server at {SLOP_URL}: {e}")
        print("Make sure SLOP is running: slop serve")
        sys.exit(1)


def get_tools(server_name: str | None = None) -> list[dict[str, Any]]:
    """Get tools for a server or all servers."""
    url = f"{SLOP_URL}/tools"
    if server_name:
        url += f"?server={server_name}"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        # Handle both array and object responses
        if isinstance(data, list):
            return data
        return data.get("tools", [])
    except requests.RequestException as e:
        print(f"Error fetching tools: {e}")
        return []


def generate_tool_skill(server_name: str, tools: list[dict[str, Any]]) -> str:
    """Generate tool reference skill content for a server."""
    content = f"""---
name: {server_name}-tools
description: Tool reference for {server_name} MCP - lists all tools and how to call them
---

# {server_name.replace('-', ' ').title()} MCP Tools Reference

Quick reference for all tools provided by the **{server_name}** MCP server.

## How to Use These Tools

Call any tool using the `/slop-exec` command:

```bash
/slop-exec {server_name}.<tool_name> --param1 "value" --param2 "value"
```

Or via REST API:

```bash
curl -X POST http://localhost:8080/tools/{server_name}.<tool_name> \\
  -H "Content-Type: application/json" \\
  -d '{{"param1": "value", "param2": "value"}}'
```

---

## Available Tools

"""

    # Generate tool documentation
    for tool in tools:
        name = tool.get("name", "unknown")
        desc = tool.get("description", "No description available")
        input_schema = tool.get("inputSchema", {})
        params = input_schema.get("properties", {})
        required = input_schema.get("required", [])

        content += f"### `{name}`\n\n"
        content += f"{desc}\n\n"

        if params:
            content += "**Parameters:**\n\n"
            content += "| Parameter | Required | Type | Description |\n"
            content += "|-----------|----------|------|-------------|\n"

            for param_name, param_info in params.items():
                req = "Yes" if param_name in required else "No"
                param_type = param_info.get("type", "string")
                param_desc = param_info.get("description", "-")
                # Escape pipe characters in description
                param_desc = param_desc.replace("|", "\\|")
                content += f"| `{param_name}` | {req} | {param_type} | {param_desc} |\n"

            content += "\n"

        # Generate usage example
        content += "**Usage:**\n\n```bash\n"
        content += f"/slop-exec {server_name}.{name}"

        if params:
            required_params = [p for p in params if p in required]
            optional_params = [p for p in params if p not in required][:2]

            for param in required_params:
                param_type = params[param].get("type", "string")
                example_value = get_example_value(param, param_type)
                content += f" \\\n  --{param} {example_value}"

            if optional_params:
                content += f" \\\n  # Optional:"
                for param in optional_params:
                    param_type = params[param].get("type", "string")
                    example_value = get_example_value(param, param_type)
                    content += f" --{param} {example_value}"

        content += "\n```\n\n---\n\n"

    # Add quick reference table
    content += "## Quick Reference Table\n\n"
    content += "| Tool | Description |\n"
    content += "|------|-------------|\n"

    for tool in tools:
        name = tool.get("name", "unknown")
        desc = tool.get("description", "No description")
        # Truncate long descriptions
        if len(desc) > 60:
            desc = desc[:57] + "..."
        desc = desc.replace("|", "\\|").replace("\n", " ")
        content += f"| `{name}` | {desc} |\n"

    content += "\n"

    return content


def get_example_value(param_name: str, param_type: str) -> str:
    """Generate example value based on parameter name and type."""
    # Common parameter patterns
    patterns = {
        "nodeId": '"1:2"',
        "fileKey": '"abc123xyz"',
        "path": '"/path/to/file"',
        "file_path": '"/path/to/file"',
        "pattern": '"*.ts"',
        "query": '"search term"',
        "url": '"https://example.com"',
        "id": '"123"',
        "name": '"example"',
        "message": '"Your message here"',
        "content": '"Content here"',
        "title": '"Title here"',
        "description": '"Description here"',
    }

    # Check for known patterns
    for key, value in patterns.items():
        if key.lower() in param_name.lower():
            return value

    # Fall back to type-based examples
    type_examples = {
        "string": '"value"',
        "number": "42",
        "integer": "42",
        "boolean": "true",
        "array": '["item1", "item2"]',
        "object": '{"key": "value"}',
    }

    return type_examples.get(param_type, '"value"')


def suggest_activities(server_name: str, tools: list[dict[str, Any]]) -> list[dict[str, str]]:
    """Suggest activity skills based on server tools."""
    suggestions = []

    # Analyze tool names and descriptions to suggest activities
    tool_names = [t.get("name", "").lower() for t in tools]
    tool_descs = " ".join([t.get("description", "").lower() for t in tools])

    # Figma-related
    if "figma" in server_name.lower() or "design" in tool_descs:
        suggestions.extend([
            {"name": "create-component", "desc": "Create a code component from a Figma design"},
            {"name": "extract-styles", "desc": "Extract design tokens and CSS variables from Figma"},
            {"name": "sync-design", "desc": "Sync design changes to existing code components"},
            {"name": "screenshot-component", "desc": "Capture screenshots of Figma components"},
        ])

    # GitHub-related
    if "github" in server_name.lower() or any("issue" in t or "pr" in t or "pull" in t for t in tool_names):
        suggestions.extend([
            {"name": "create-pr", "desc": "Create pull request with standard template"},
            {"name": "review-pr", "desc": "Review and comment on pull requests"},
            {"name": "manage-issues", "desc": "Batch create, update, or close issues"},
            {"name": "sync-labels", "desc": "Synchronize labels across repositories"},
        ])

    # Filesystem-related
    if "filesystem" in server_name.lower() or any("read" in t or "write" in t or "file" in t for t in tool_names):
        suggestions.extend([
            {"name": "batch-rename", "desc": "Rename multiple files with patterns"},
            {"name": "find-replace", "desc": "Find and replace text across files"},
            {"name": "organize-files", "desc": "Organize files by type, date, or custom rules"},
        ])

    # Database-related
    if any("query" in t or "sql" in t or "database" in t for t in tool_names):
        suggestions.extend([
            {"name": "run-migration", "desc": "Run database migrations safely"},
            {"name": "backup-data", "desc": "Backup specific tables or datasets"},
            {"name": "analyze-schema", "desc": "Analyze and document database schema"},
        ])

    # Code search/analysis
    if "lci" in server_name.lower() or "search" in tool_descs:
        suggestions.extend([
            {"name": "find-usages", "desc": "Find all usages of a function or symbol"},
            {"name": "analyze-dependencies", "desc": "Analyze code dependencies"},
            {"name": "find-dead-code", "desc": "Find unused functions and exports"},
        ])

    # Generic suggestions if no specific matches
    if not suggestions:
        suggestions.extend([
            {"name": "batch-operation", "desc": "Run operations on multiple items"},
            {"name": "generate-report", "desc": "Generate a summary report"},
            {"name": "validate-data", "desc": "Validate data against rules"},
        ])

    return suggestions


def generate_activity_skill(
    server_name: str, activity_name: str, activity_desc: str, tools: list[dict[str, Any]]
) -> str:
    """Generate activity skill content."""
    content = f"""---
name: {server_name}-{activity_name}
description: {activity_desc} using {server_name} MCP
---

# {activity_name.replace('-', ' ').title()}

{activity_desc}

## Prerequisites

- SLOP server running with **{server_name}** MCP enabled
- Required credentials/tokens configured in environment

## Overview

This activity combines multiple {server_name} tools to accomplish:
{activity_desc.lower()}

## Steps

### 1. Preparation

Before starting, ensure you have:
- [ ] SLOP server running
- [ ] {server_name} MCP enabled and healthy
- [ ] Required inputs ready

### 2. Execute Main Action

```bash
# Primary tool call
/slop-exec {server_name}.<tool_name> --param "value"
```

### 3. Verify Results

```bash
# Verification tool call
/slop-exec {server_name}.<verification_tool> --param "value"
```

## Available Tools for This Activity

The following tools from {server_name} are relevant:

"""

    # Add relevant tools
    for tool in tools[:5]:  # Show first 5 tools
        name = tool.get("name", "unknown")
        desc = tool.get("description", "No description")
        if len(desc) > 80:
            desc = desc[:77] + "..."
        content += f"- `{name}` - {desc}\n"

    content += """

## Variations

### Quick Mode
For simple cases, use minimal options:
```bash
/slop-exec {server_name}.<tool> --essential-param "value"
```

### Detailed Mode
For comprehensive results, include all options:
```bash
/slop-exec {server_name}.<tool> --param1 "value" --param2 "value" --verbose true
```

## Troubleshooting

### Tool Not Found
Ensure the server is running:
```bash
curl http://localhost:8080/info
```

### Permission Errors
Check credentials are set in environment variables.

### Timeout Errors
Increase timeout in SLOP config or retry with smaller inputs.

## Related Skills

- `{server_name}-tools` - Full tool reference
"""

    return content.format(server_name=server_name)


def save_skill(filename: str, content: str) -> Path:
    """Save skill content to file."""
    SKILLS_DIR.mkdir(parents=True, exist_ok=True)
    path = SKILLS_DIR / filename
    path.write_text(content, encoding="utf-8")
    return path


def interactive_activities(server_name: str, tools: list[dict[str, Any]]) -> None:
    """Interactive mode for creating activity skills."""
    suggestions = suggest_activities(server_name, tools)

    print(f"\n{'='*60}")
    print(f"Activity Skill Generator for: {server_name}")
    print(f"{'='*60}\n")

    print("Suggested activities based on available tools:\n")
    for i, sug in enumerate(suggestions, 1):
        print(f"  {i}. {sug['name']} - {sug['desc']}")

    print(f"\n  {len(suggestions)+1}. [Custom] Create your own activity")
    print("  0. Done\n")

    while True:
        try:
            choice = input("Select activity to create (number): ").strip()
            if choice == "0":
                break

            if choice == str(len(suggestions) + 1):
                # Custom activity
                name = input("Activity name (kebab-case): ").strip()
                desc = input("Activity description: ").strip()
                if not name or not desc:
                    print("Name and description required.")
                    continue
            else:
                idx = int(choice) - 1
                if idx < 0 or idx >= len(suggestions):
                    print("Invalid selection.")
                    continue
                name = suggestions[idx]["name"]
                desc = suggestions[idx]["desc"]

            content = generate_activity_skill(server_name, name, desc, tools)
            filename = f"{server_name}-{name}.md"
            path = save_skill(filename, content)
            print(f"  Created: {path}\n")

        except ValueError:
            print("Please enter a number.")
        except KeyboardInterrupt:
            print("\nCancelled.")
            break


def main() -> None:
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Generate skills for SLOP-managed MCP servers",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    %(prog)s figma              Generate tool reference for figma MCP
    %(prog)s --all              Generate tool references for all MCPs
    %(prog)s figma --activities Interactive activity skill creation
        """,
    )
    parser.add_argument("server", nargs="?", help="MCP server name")
    parser.add_argument("--all", action="store_true", help="Generate for all servers")
    parser.add_argument(
        "--activities",
        action="store_true",
        help="Interactive mode for creating activity skills",
    )
    parser.add_argument(
        "--url",
        default=SLOP_URL,
        help=f"SLOP server URL (default: {SLOP_URL})",
    )

    args = parser.parse_args()

    global SLOP_URL
    SLOP_URL = args.url

    if args.all:
        servers = get_servers()
        if not servers:
            print("No servers found. Is SLOP running?")
            sys.exit(1)

        print(f"Generating tool reference skills for {len(servers)} servers...\n")
        for server in servers:
            name = server.get("name", server) if isinstance(server, dict) else server
            tools = get_tools(name)
            if tools:
                content = generate_tool_skill(name, tools)
                path = save_skill(f"{name}-tools.md", content)
                print(f"  Created: {path} ({len(tools)} tools)")
            else:
                print(f"  Skipped: {name} (no tools found)")

    elif args.server:
        tools = get_tools(args.server)
        if not tools:
            print(f"No tools found for server: {args.server}")
            print("Available servers:")
            for s in get_servers():
                name = s.get("name", s) if isinstance(s, dict) else s
                print(f"  - {name}")
            sys.exit(1)

        # Generate tool reference skill
        content = generate_tool_skill(args.server, tools)
        path = save_skill(f"{args.server}-tools.md", content)
        print(f"Created tool reference: {path} ({len(tools)} tools)")

        # Interactive activity creation
        if args.activities:
            interactive_activities(args.server, tools)

    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
