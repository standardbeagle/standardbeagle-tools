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
LOOP_FILE = Path(".claude/dartai-loop-state.json")
CONFIG_FILE = Path(".claude/dartai.local.md")
LOCKS_FILE = Path(".dartai-locks.json")


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


def determine_next_action(loop_data):
    """
    Determine what action to take based on loop state.

    Returns: tuple of (action, reason)
    Actions: continue, replan, stop
    """
    # Get most recent task result from structured state
    tasks = loop_data.get("tasks", [])

    if not tasks:
        # No tasks processed yet, continue
        return "continue", "no tasks processed yet"

    last_task = tasks[-1]
    status = last_task.get("status", "unknown")

    if status == "completed":
        # Last task succeeded - continue to next task
        return "continue", "last task completed successfully"
    elif status == "failed":
        # Last task failed - check if there's a fix task or need replan
        if last_task.get("fix_task_created"):
            return "continue", "fix task created, processing it next"
        else:
            failed_phase = last_task.get("failed_phase", "unknown")
            return "replan", f"task failed at {failed_phase}"
    else:
        # Unknown state - continue to check for more tasks
        return "continue", "checking for remaining tasks"


def check_remaining_tasks():
    """
    Check if there are remaining tasks in an active loop.

    Issues a directive for Claude to continue the loop with appropriate action.
    Uses runner_instance_id to filter tasks claimable by this runner.
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

    # Determine what action to take
    action, reason = determine_next_action(loop_data)
    iterations = loop_data.get("iterations", 0)
    loop_task_id = loop_data.get("loop_task_id")
    runner_instance_id = loop_data.get("runner_instance_id", "unknown")

    # Read lock file to report claim state
    locks = {}
    if LOCKS_FILE.exists():
        try:
            with open(LOCKS_FILE) as f:
                locks = json.load(f).get("claims", {})
        except Exception:
            pass
    other_claims = sum(
        1 for c in locks.values()
        if c.get("runner_instance_id") != runner_instance_id
    )

    # Build the directive based on action
    if action == "continue":
        directive = (
            f"CONTINUE LOOP (runner {runner_instance_id}): "
            f"Query Dart for 'To-do' tasks on '{dartboard}'. "
            f"Read .dartai-locks.json, skip tasks claimed by other runners "
            f"({other_claims} other claims active). "
            f"Claim next eligible task via git lock and spawn dartai:task-executor."
        )
    elif action == "replan":
        directive = (
            f"REPLAN REQUIRED (runner {runner_instance_id}): {reason}. "
            f"Query Dart for task state, check for fix tasks or blocked tasks. "
            f"Create fix task if needed, then continue with next actionable task."
        )
    else:
        directive = f"CHECK LOOP STATE: {reason}"

    return {
        "continue_loop": True,
        "action": action,
        "reason": reason,
        "dartboard": dartboard,
        "loop_task_id": loop_task_id,
        "runner_instance_id": runner_instance_id,
        "iterations_completed": iterations,
        "last_iteration_at": loop_data.get("last_iteration_at"),
        "directive": directive,
        "command": f"DO NOT STOP. {directive}"
    }


if __name__ == "__main__":
    result = check_remaining_tasks()
    print(json.dumps(result))
