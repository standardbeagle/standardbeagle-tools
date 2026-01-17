#!/usr/bin/env python3
"""
Check Remaining Tasks - Stop hook to continue loop if tasks remain.

This hook runs at Stop to check if there's an active dartai loop with
remaining tasks. If so, it signals Claude to continue the loop instead
of stopping.
"""

import json
import os
from datetime import datetime
from pathlib import Path

STATE_DIR = Path.home() / ".dartai"
LOOP_FILE = Path(".claude/dartai-loop.json")
CONFIG_FILE = Path(".claude/dartai.local.md")


def parse_config():
    """Parse the dartai config file for dartboard settings."""
    if not CONFIG_FILE.exists():
        return {}

    text = CONFIG_FILE.read_text()

    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            try:
                import yaml
                return yaml.safe_load(parts[1]) or {}
            except Exception:
                pass
    return {}


def check_active_loop():
    """Check if there's an active dartai loop."""
    if not LOOP_FILE.exists():
        return None

    try:
        with open(LOOP_FILE) as f:
            loop_data = json.load(f)

        # Check if loop appears active (has iterations and recent activity)
        if loop_data.get("iterations", 0) > 0:
            return loop_data
    except Exception:
        pass

    return None


def get_active_dartboard():
    """Get the active dartboard from session or config."""
    # First check session file
    session_file = STATE_DIR / "current_session.json"
    if session_file.exists():
        try:
            with open(session_file) as f:
                session = json.load(f)
            if session.get("active_dartboard"):
                return session["active_dartboard"]
        except Exception:
            pass

    # Fall back to config
    config = parse_config()
    return config.get("last_dartboard") or config.get("default_dartboard")


def check_remaining_tasks():
    """
    Check if there are remaining tasks in an active loop.

    Returns a signal for Claude to check Dart and continue if tasks remain.
    """
    loop_data = check_active_loop()

    if not loop_data:
        return {
            "continue_loop": False,
            "reason": "no_active_loop"
        }

    dartboard = get_active_dartboard()

    if not dartboard:
        return {
            "continue_loop": False,
            "reason": "no_dartboard"
        }

    # Active loop found - signal Claude to check for remaining tasks
    return {
        "continue_loop": True,
        "dartboard": dartboard,
        "iterations_completed": loop_data.get("iterations", 0),
        "last_iteration_at": loop_data.get("last_iteration_at"),
        "message": f"ACTIVE DARTAI LOOP DETECTED on '{dartboard}'. "
                   f"Before stopping, check Dart for remaining tasks: "
                   f"Use list_tasks with dartboard='{dartboard}' and is_completed=false. "
                   f"If tasks remain (status 'To-do' or 'In Progress'), continue the loop. "
                   f"Only stop if all tasks are completed or user explicitly requested stop."
    }


if __name__ == "__main__":
    result = check_remaining_tasks()
    print(json.dumps(result))
