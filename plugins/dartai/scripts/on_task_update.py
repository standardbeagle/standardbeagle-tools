#!/usr/bin/env python3
"""
On Task Update - Hook triggered after Dart task updates.

This hook runs after mcp__dart-query__update_task to track task progress
and trigger documentation updates when tasks are completed.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

STATE_DIR = Path.home() / ".dartai"


def on_task_update():
    """Handle task update event."""
    # Read hook input from stdin if available
    task_info = {}
    if not sys.stdin.isatty():
        try:
            input_data = sys.stdin.read()
            if input_data:
                task_info = json.loads(input_data)
        except:
            pass

    # Log the update
    log_file = STATE_DIR / "task_updates.log"
    STATE_DIR.mkdir(parents=True, exist_ok=True)

    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "task_info": task_info,
        "working_dir": os.getcwd()
    }

    with open(log_file, "a") as f:
        f.write(json.dumps(log_entry) + "\n")

    return {
        "success": True,
        "logged": True,
        "timestamp": log_entry["timestamp"]
    }


if __name__ == "__main__":
    result = on_task_update()
    print(json.dumps(result))
