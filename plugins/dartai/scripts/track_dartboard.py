#!/usr/bin/env python3
"""
Track Dartboard - Save last used dartboard after Dart operations.

This hook runs after Dart list_tasks and create_task to track the dartboard used.
Reads the tool input from stdin and extracts the dartboard parameter.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

CONFIG_DIR = Path(".claude")
CONFIG_FILE = CONFIG_DIR / "dartai.local.md"


def parse_config():
    """Parse the dartai config file, extracting YAML frontmatter."""
    if not CONFIG_FILE.exists():
        return {"frontmatter": {}, "content": ""}

    text = CONFIG_FILE.read_text()

    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            try:
                import yaml
                frontmatter = yaml.safe_load(parts[1]) or {}
            except Exception:
                frontmatter = {}
            content = parts[2].strip()
            return {"frontmatter": frontmatter, "content": content}

    return {"frontmatter": {}, "content": text}


def write_config(frontmatter: dict, content: str = ""):
    """Write config with YAML frontmatter."""
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)

    try:
        import yaml
        yaml_content = yaml.dump(frontmatter, default_flow_style=False, sort_keys=False)
    except ImportError:
        # Fallback to simple format if yaml not available
        yaml_content = "\n".join(f"{k}: {v}" for k, v in frontmatter.items())

    output = f"---\n{yaml_content}---\n\n{content}"
    CONFIG_FILE.write_text(output)


def save_dartboard(dartboard: str):
    """Save the dartboard as last used."""
    if not dartboard:
        return

    config = parse_config()
    fm = config["frontmatter"]

    fm["last_dartboard"] = dartboard
    fm["last_dartboard_used_at"] = datetime.now().isoformat()

    write_config(fm, config["content"])
    return {"saved": True, "dartboard": dartboard}


def main():
    """Extract dartboard from hook input and save it."""
    try:
        # Read hook input from stdin
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"skipped": True, "reason": "no input"}))
            return

        hook_data = json.loads(input_data)

        # Extract dartboard from tool input
        # Hook data structure: {"tool_name": "...", "tool_input": {...}, "tool_result": ...}
        tool_input = hook_data.get("tool_input", {})

        # For slop-mcp execute_tool, dig into parameters
        if "parameters" in tool_input:
            dartboard = tool_input["parameters"].get("dartboard")
        else:
            # Direct MCP call
            dartboard = tool_input.get("dartboard")

        if dartboard:
            result = save_dartboard(dartboard)
            print(json.dumps(result))
        else:
            print(json.dumps({"skipped": True, "reason": "no dartboard in input"}))

    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON input"}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))


if __name__ == "__main__":
    main()
