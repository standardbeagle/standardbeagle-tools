#!/usr/bin/env python3
"""
Session Init - Initialize dartai session on startup.

This hook runs at SessionStart to prepare the dartai environment.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

STATE_DIR = Path.home() / ".dartai"


def init_session():
    """Initialize dartai session."""
    # Ensure state directory exists
    STATE_DIR.mkdir(parents=True, exist_ok=True)

    # Create session file
    session_file = STATE_DIR / "current_session.json"
    session_data = {
        "started_at": datetime.now().isoformat(),
        "working_dir": os.getcwd(),
        "pid": os.getpid()
    }

    with open(session_file, "w") as f:
        json.dump(session_data, f, indent=2)

    # Initialize tracked changes file if not exists
    changes_file = STATE_DIR / "tracked_changes.json"
    if not changes_file.exists():
        with open(changes_file, "w") as f:
            json.dump({"changes": []}, f)

    return {
        "success": True,
        "session_started": session_data["started_at"],
        "state_dir": str(STATE_DIR)
    }


if __name__ == "__main__":
    result = init_session()
    print(json.dumps(result))
