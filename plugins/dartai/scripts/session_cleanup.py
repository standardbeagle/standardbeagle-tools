#!/usr/bin/env python3
"""
Session Cleanup - Clean up dartai session on stop.

This hook runs at Stop to clean up the dartai session state.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

STATE_DIR = Path.home() / ".dartai"


def cleanup_session():
    """Clean up dartai session."""
    session_file = STATE_DIR / "current_session.json"

    session_data = None
    if session_file.exists():
        try:
            with open(session_file) as f:
                session_data = json.load(f)
            session_file.unlink()
        except:
            pass

    # Archive session to history
    if session_data:
        history_file = STATE_DIR / "session_history.json"
        history = {"sessions": []}

        if history_file.exists():
            try:
                with open(history_file) as f:
                    history = json.load(f)
            except:
                pass

        session_data["ended_at"] = datetime.now().isoformat()
        history["sessions"].append(session_data)

        # Keep only last 20 sessions
        history["sessions"] = history["sessions"][-20:]

        with open(history_file, "w") as f:
            json.dump(history, f, indent=2)

    return {
        "success": True,
        "session_ended": datetime.now().isoformat(),
        "archived": session_data is not None
    }


if __name__ == "__main__":
    result = cleanup_session()
    print(json.dumps(result))
