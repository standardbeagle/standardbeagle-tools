#!/usr/bin/env python3
"""
Dartboard Memory - Manages dartboard preferences in project memory.

Stores last used dartboard and default dartboard in .claude/dartai.local.md
with YAML frontmatter for settings and markdown content for notes.
"""

import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

CONFIG_DIR = Path(".claude")
CONFIG_FILE = CONFIG_DIR / "dartai.local.md"


def parse_config():
    """Parse the dartai config file, extracting YAML frontmatter and content."""
    if not CONFIG_FILE.exists():
        return {
            "frontmatter": {},
            "content": ""
        }

    text = CONFIG_FILE.read_text()

    # Check for YAML frontmatter (between --- markers)
    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            import yaml
            try:
                frontmatter = yaml.safe_load(parts[1]) or {}
            except Exception:
                frontmatter = {}
            content = parts[2].strip()
            return {"frontmatter": frontmatter, "content": content}

    # No frontmatter, just markdown content
    return {"frontmatter": {}, "content": text}


def write_config(frontmatter: dict, content: str = ""):
    """Write config with YAML frontmatter and markdown content."""
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)

    import yaml
    yaml_content = yaml.dump(frontmatter, default_flow_style=False, sort_keys=False)

    output = f"---\n{yaml_content}---\n\n{content}"
    CONFIG_FILE.write_text(output)


def get_last_dartboard() -> str | None:
    """Get the last used dartboard from config."""
    config = parse_config()
    return config["frontmatter"].get("last_dartboard")


def get_default_dartboard() -> str | None:
    """Get the default dartboard from config."""
    config = parse_config()
    return config["frontmatter"].get("default_dartboard")


def get_dartboard() -> str | None:
    """Get dartboard to use: last_dartboard if set, else default_dartboard."""
    config = parse_config()
    fm = config["frontmatter"]
    return fm.get("last_dartboard") or fm.get("default_dartboard")


def set_last_dartboard(dartboard: str):
    """Set the last used dartboard in config."""
    config = parse_config()
    fm = config["frontmatter"]

    fm["last_dartboard"] = dartboard
    fm["last_dartboard_used_at"] = datetime.now().isoformat()

    write_config(fm, config["content"])


def set_default_dartboard(dartboard: str):
    """Set the default dartboard in config."""
    config = parse_config()
    fm = config["frontmatter"]

    fm["default_dartboard"] = dartboard

    write_config(fm, config["content"])


def clear_last_dartboard():
    """Clear the last used dartboard (keeps default)."""
    config = parse_config()
    fm = config["frontmatter"]

    fm.pop("last_dartboard", None)
    fm.pop("last_dartboard_used_at", None)

    write_config(fm, config["content"])


def get_config_value(key: str) -> str | None:
    """Get any config value from frontmatter."""
    config = parse_config()
    return config["frontmatter"].get(key)


def set_config_value(key: str, value):
    """Set any config value in frontmatter."""
    config = parse_config()
    config["frontmatter"][key] = value
    write_config(config["frontmatter"], config["content"])


def main():
    """CLI interface for dartboard memory."""
    if len(sys.argv) < 2:
        print(json.dumps({
            "error": "Usage: dartboard_memory.py <command> [args]",
            "commands": ["get", "get-default", "get-last", "set-default", "set-last", "clear-last"]
        }))
        sys.exit(1)

    command = sys.argv[1]

    try:
        if command == "get":
            # Get best dartboard to use
            dartboard = get_dartboard()
            print(json.dumps({"dartboard": dartboard}))

        elif command == "get-default":
            dartboard = get_default_dartboard()
            print(json.dumps({"default_dartboard": dartboard}))

        elif command == "get-last":
            dartboard = get_last_dartboard()
            print(json.dumps({"last_dartboard": dartboard}))

        elif command == "set-default":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Missing dartboard name"}))
                sys.exit(1)
            dartboard = sys.argv[2]
            set_default_dartboard(dartboard)
            print(json.dumps({"success": True, "default_dartboard": dartboard}))

        elif command == "set-last":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Missing dartboard name"}))
                sys.exit(1)
            dartboard = sys.argv[2]
            set_last_dartboard(dartboard)
            print(json.dumps({"success": True, "last_dartboard": dartboard}))

        elif command == "clear-last":
            clear_last_dartboard()
            print(json.dumps({"success": True, "message": "Last dartboard cleared"}))

        elif command == "get-config":
            if len(sys.argv) < 3:
                config = parse_config()
                print(json.dumps(config["frontmatter"]))
            else:
                key = sys.argv[2]
                value = get_config_value(key)
                print(json.dumps({key: value}))

        else:
            print(json.dumps({"error": f"Unknown command: {command}"}))
            sys.exit(1)

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
