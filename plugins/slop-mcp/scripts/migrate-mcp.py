#!/usr/bin/env python3
"""
migrate-mcp.py - Migrate MCP configurations to SLOP management
"""

import json
import os
import shutil
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

import yaml


def get_claude_desktop_config_path() -> Path | None:
    """Find Claude Desktop config file."""
    paths = [
        Path.home() / "Library/Application Support/Claude/claude_desktop_config.json",  # macOS
        Path.home() / ".config/claude/claude_desktop_config.json",  # Linux
        Path(os.environ.get("APPDATA", "")) / "Claude/claude_desktop_config.json",  # Windows
    ]
    for path in paths:
        if path.exists():
            return path
    return None


def get_vscode_config_path() -> Path | None:
    """Find VS Code MCP config in current workspace."""
    paths = [
        Path.cwd() / ".vscode/mcp.json",
        Path.cwd() / "mcp.json",
    ]
    for path in paths:
        if path.exists():
            return path
    return None


def get_cursor_config_path() -> Path | None:
    """Find Cursor MCP config."""
    path = Path.home() / ".cursor/mcp.json"
    return path if path.exists() else None


def load_mcp_config(source: str) -> tuple[Path, dict]:
    """Load MCP configuration from source."""
    if source == "claude-desktop":
        path = get_claude_desktop_config_path()
        if not path:
            raise FileNotFoundError("Claude Desktop config not found")
    elif source == "vscode":
        path = get_vscode_config_path()
        if not path:
            raise FileNotFoundError("VS Code MCP config not found")
    elif source == "cursor":
        path = get_cursor_config_path()
        if not path:
            raise FileNotFoundError("Cursor config not found")
    elif source == "auto":
        # Try all sources
        for src in ["claude-desktop", "vscode", "cursor"]:
            try:
                return load_mcp_config(src)
            except FileNotFoundError:
                continue
        raise FileNotFoundError("No MCP config found")
    else:
        path = Path(source)
        if not path.exists():
            raise FileNotFoundError(f"Config file not found: {source}")

    with open(path) as f:
        config = json.load(f)

    return path, config


def parse_servers(config: dict) -> list[dict]:
    """Extract server definitions from MCP config."""
    servers = []

    # Claude Desktop format
    if "mcpServers" in config:
        for name, server in config["mcpServers"].items():
            servers.append({
                "name": name,
                "command": server.get("command", ""),
                "args": server.get("args", []),
                "env": server.get("env", {}),
                "enabled": True,
            })

    # VS Code format
    elif "servers" in config:
        for name, server in config["servers"].items():
            servers.append({
                "name": name,
                "command": server.get("command", ""),
                "args": server.get("args", []),
                "env": server.get("env", {}),
                "enabled": True,
            })

    return servers


def backup_config(source_path: Path, slop_dir: Path) -> Path:
    """Create backup of source config."""
    migrations_dir = slop_dir / "migrations"
    migrations_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    backup_name = f"{source_path.stem}-{timestamp}{source_path.suffix}"
    backup_path = migrations_dir / backup_name

    shutil.copy2(source_path, backup_path)
    return backup_path


def load_slop_config(slop_dir: Path) -> dict:
    """Load existing SLOP configuration."""
    config_path = slop_dir / "config/slop.yaml"
    if config_path.exists():
        with open(config_path) as f:
            return yaml.safe_load(f) or {}
    return {
        "version": "1.0",
        "servers": [],
    }


def save_slop_config(slop_dir: Path, config: dict) -> None:
    """Save SLOP configuration."""
    config_path = slop_dir / "config/slop.yaml"
    config_path.parent.mkdir(parents=True, exist_ok=True)
    with open(config_path, "w") as f:
        yaml.dump(config, f, default_flow_style=False, sort_keys=False)


def migrate(source: str, slop_dir: Path | None = None, exclude: list[str] | None = None) -> dict[str, Any]:
    """Migrate MCP configuration to SLOP."""
    slop_dir = slop_dir or Path.home() / "slop-mcp"
    exclude = exclude or []

    # Load source config
    source_path, source_config = load_mcp_config(source)

    # Backup
    backup_path = backup_config(source_path, slop_dir)

    # Parse servers
    servers = parse_servers(source_config)

    # Filter excluded
    servers = [s for s in servers if s["name"] not in exclude]

    # Load existing SLOP config
    slop_config = load_slop_config(slop_dir)

    # Get existing server names
    existing_names = {s["name"] for s in slop_config.get("servers", [])}

    # Add new servers
    added = []
    skipped = []
    for server in servers:
        if server["name"] in existing_names:
            skipped.append(server["name"])
        else:
            slop_config.setdefault("servers", []).append(server)
            added.append(server["name"])

    # Save updated config
    save_slop_config(slop_dir, slop_config)

    return {
        "source": str(source_path),
        "backup": str(backup_path),
        "added": added,
        "skipped": skipped,
        "total": len(servers),
    }


def main():
    """CLI entry point."""
    if len(sys.argv) < 2:
        print("Usage: migrate-mcp.py <source> [--exclude name1,name2]")
        print("")
        print("Sources:")
        print("  claude-desktop  - Claude Desktop config")
        print("  vscode          - VS Code MCP config")
        print("  cursor          - Cursor config")
        print("  auto            - Auto-detect")
        print("  /path/to/file   - Custom config file")
        sys.exit(1)

    source = sys.argv[1]
    exclude = []

    # Parse --exclude
    for i, arg in enumerate(sys.argv[2:], 2):
        if arg == "--exclude" and i + 1 < len(sys.argv):
            exclude = sys.argv[i + 1].split(",")
            break

    try:
        result = migrate(source, exclude=exclude)
        print(f"Migration complete!")
        print(f"  Source: {result['source']}")
        print(f"  Backup: {result['backup']}")
        print(f"  Added: {len(result['added'])} servers")
        if result["added"]:
            for name in result["added"]:
                print(f"    - {name}")
        if result["skipped"]:
            print(f"  Skipped (already exists): {len(result['skipped'])}")
            for name in result["skipped"]:
                print(f"    - {name}")
    except FileNotFoundError as e:
        print(f"Error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Migration failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
