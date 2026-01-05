#!/usr/bin/env python3
"""
Track Changes - Hook triggered after Write/Edit operations.

This hook tracks file changes during task execution for documentation
and review purposes.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

STATE_DIR = Path.home() / ".dartai"
CHANGES_FILE = STATE_DIR / "tracked_changes.json"


def track_change():
    """Track a file change event."""
    # Read hook input from stdin if available
    change_info = {}
    if not sys.stdin.isatty():
        try:
            input_data = sys.stdin.read()
            if input_data:
                change_info = json.loads(input_data)
        except:
            pass

    # Ensure state directory exists
    STATE_DIR.mkdir(parents=True, exist_ok=True)

    # Load existing changes
    changes = {"changes": []}
    if CHANGES_FILE.exists():
        try:
            with open(CHANGES_FILE) as f:
                changes = json.load(f)
        except:
            pass

    # Add new change
    change_entry = {
        "timestamp": datetime.now().isoformat(),
        "working_dir": os.getcwd(),
        "info": change_info
    }

    changes["changes"].append(change_entry)

    # Keep only last 100 changes
    changes["changes"] = changes["changes"][-100:]

    # Save changes
    with open(CHANGES_FILE, "w") as f:
        json.dump(changes, f, indent=2)

    return {
        "success": True,
        "tracked": True,
        "total_changes": len(changes["changes"])
    }


if __name__ == "__main__":
    result = track_change()
    print(json.dumps(result))
