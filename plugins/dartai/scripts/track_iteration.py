#!/usr/bin/env python3
"""
Track Loop Iteration - SubagentStop hook for task-executor.

This hook fires when dartai:task-executor subagent completes.
Tracks iteration count only - task state is in Dart.
"""

import json
import os
from datetime import datetime
from pathlib import Path

# Minimal orchestration state - task state lives in Dart
LOOP_FILE = Path(".claude/dartai-loop.json")


def track_iteration():
    """Track iteration count. Task state is in Dart, not here."""
    loop = {"iterations": 0, "started_at": None}
    if LOOP_FILE.exists():
        try:
            with open(LOOP_FILE) as f:
                loop = json.load(f)
        except Exception:
            pass

    # Only track orchestration metrics
    loop["iterations"] = loop.get("iterations", 0) + 1
    loop["last_iteration_at"] = datetime.now().isoformat()
    loop["last_subagent"] = os.environ.get("CLAUDE_SUBAGENT_ID", "unknown")

    LOOP_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(LOOP_FILE, "w") as f:
        json.dump(loop, f, indent=2)

    # Signal: subagent completed, main loop should check Dart for next task
    return {
        "success": True,
        "iteration": loop["iterations"],
        "message": "Subagent done. Check Dart for task status and next task."
    }


if __name__ == "__main__":
    print(json.dumps(track_iteration()))
