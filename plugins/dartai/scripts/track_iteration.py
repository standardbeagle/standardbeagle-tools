#!/usr/bin/env python3
"""
Track Loop Iteration - SubagentStop hook for task-executor.

This hook fires when dartai:task-executor subagent completes.
Reads structured state from .claude/dartai-loop-state.json that
the subagent wrote before termination.
"""

import json
import os
from datetime import datetime
from pathlib import Path

# Loop state file (written by subagent before termination)
LOOP_FILE = Path(".claude/dartai-loop-state.json")


def track_iteration():
    """
    Track iteration completion using structured state from file.

    The subagent writes complete status to the loop state file BEFORE
    it terminates, so we just need to read it and update metrics.
    """
    loop = {
        "iterations": 0,
        "spawns": 0,
        "started_at": None,
        "tasks": []
    }

    if LOOP_FILE.exists():
        try:
            with open(LOOP_FILE) as f:
                loop = json.load(f)
        except Exception as e:
            # File exists but couldn't parse - non-fatal
            print(json.dumps({
                "success": False,
                "error": f"Failed to parse loop state file: {e}",
                "message": "Loop state file corrupted - continuing with empty state"
            }))
            return

    # Increment iteration count
    loop["iterations"] = loop.get("iterations", 0) + 1
    loop["last_iteration_at"] = datetime.now().isoformat()
    loop["last_subagent"] = os.environ.get("CLAUDE_SUBAGENT_ID", "unknown")

    # Get the most recent task result (written by subagent)
    tasks = loop.get("tasks", [])
    if tasks:
        latest_task = tasks[-1]
        status = latest_task.get("status", "unknown")

        # Build message based on structured status
        if status == "completed":
            message = f"Task completed. Continue to next task."
        elif status == "failed":
            failed_phase = latest_task.get("failed_phase", "unknown")
            message = f"Task failed at {failed_phase}. Replan and continue."
        else:
            message = "Subagent done. Check Dart for task status."
    else:
        # No task results yet (first iteration still in progress?)
        status = "unknown"
        message = "Iteration tracked. Waiting for task result."

    # Write updated loop file
    LOOP_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(LOOP_FILE, "w") as f:
        json.dump(loop, f, indent=2)

    return {
        "success": True,
        "iteration": loop["iterations"],
        "result_status": status if tasks else "unknown",
        "message": message
    }


if __name__ == "__main__":
    print(json.dumps(track_iteration()))
