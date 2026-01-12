#!/usr/bin/env python3
"""
Session Init - Initialize dartai session on startup.

This hook runs at SessionStart to prepare the dartai environment.
Loads dartboard memory from project config for quick access.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

STATE_DIR = Path.home() / ".dartai"
CONFIG_DIR = Path(".claude")
CONFIG_FILE = CONFIG_DIR / "dartai.local.md"


def parse_project_config():
    """Parse the project's dartai config file for dartboard settings."""
    if not CONFIG_FILE.exists():
        return {}

    text = CONFIG_FILE.read_text()

    # Check for YAML frontmatter (between --- markers)
    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            try:
                import yaml
                return yaml.safe_load(parts[1]) or {}
            except Exception:
                pass
    return {}


def init_session():
    """Initialize dartai session."""
    # Ensure state directory exists
    STATE_DIR.mkdir(parents=True, exist_ok=True)

    # Load project config for dartboard settings
    project_config = parse_project_config()
    last_dartboard = project_config.get("last_dartboard")
    default_dartboard = project_config.get("default_dartboard")

    # Create session file with dartboard info
    session_file = STATE_DIR / "current_session.json"
    session_data = {
        "started_at": datetime.now().isoformat(),
        "working_dir": os.getcwd(),
        "pid": os.getpid(),
        "last_dartboard": last_dartboard,
        "default_dartboard": default_dartboard,
        "active_dartboard": last_dartboard or default_dartboard
    }

    with open(session_file, "w") as f:
        json.dump(session_data, f, indent=2)

    # Initialize tracked changes file if not exists
    changes_file = STATE_DIR / "tracked_changes.json"
    if not changes_file.exists():
        with open(changes_file, "w") as f:
            json.dump({"changes": []}, f)

    result = {
        "success": True,
        "session_started": session_data["started_at"],
        "state_dir": str(STATE_DIR)
    }

    # Include dartboard info if available
    if session_data["active_dartboard"]:
        result["active_dartboard"] = session_data["active_dartboard"]
        result["dartboard_source"] = "last_used" if last_dartboard else "default"

    return result


if __name__ == "__main__":
    result = init_session()
    print(json.dumps(result))
