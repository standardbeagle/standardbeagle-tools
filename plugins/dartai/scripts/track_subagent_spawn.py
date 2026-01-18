#!/usr/bin/env python3
"""
Track Subagent Spawn - PostToolUse hook for Task tool.

This hook fires when a new subagent is spawned via the Task tool.
Tracks spawns for context isolation verification.
"""

import json
import os
from datetime import datetime
from pathlib import Path

STATE_DIR = Path.home() / ".dartai"
LOOP_FILE = Path(".claude/dartai-loop-state.json")


def track_spawn():
    """Track subagent spawn for context isolation verification."""
    # Ensure state directory exists
    STATE_DIR.mkdir(parents=True, exist_ok=True)

    # Load current loop state
    loop = {"iterations": 0, "spawns": 0, "started_at": None}
    if LOOP_FILE.exists():
        try:
            with open(LOOP_FILE) as f:
                loop = json.load(f)
        except Exception:
            pass

    # Increment spawn count
    loop["spawns"] = loop.get("spawns", 0) + 1
    loop["last_spawn_at"] = datetime.now().isoformat()

    # Get subagent type if available
    subagent_type = os.environ.get("CLAUDE_SUBAGENT_TYPE", "unknown")

    # Track spawn in log for audit trail
    spawn_log = STATE_DIR / "spawns.log"
    with open(spawn_log, "a") as f:
        f.write(f"{datetime.now().isoformat()} - Spawn #{loop['spawns']}: {subagent_type}\n")

    # Update loop file
    LOOP_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(LOOP_FILE, "w") as f:
        json.dump(loop, f, indent=2)

    return {
        "success": True,
        "spawn_count": loop["spawns"],
        "subagent_type": subagent_type
    }


if __name__ == "__main__":
    print(json.dumps(track_spawn()))
