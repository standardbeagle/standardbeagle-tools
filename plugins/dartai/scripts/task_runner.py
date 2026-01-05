#!/usr/bin/env python3
"""
Task Runner - Main orchestration script for Ralph Wiggum loop.

This script manages the continuous task execution loop, fetching tasks
from a Dart dartboard and processing them through the quality pipeline.
"""

import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Optional

# State file for tracking loop status
STATE_FILE = Path.home() / ".dartai" / "loop_state.json"
CHANGES_FILE = Path.home() / ".dartai" / "tracked_changes.json"


def ensure_state_dir():
    """Ensure the state directory exists."""
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)


def load_state() -> dict:
    """Load the current loop state."""
    if STATE_FILE.exists():
        with open(STATE_FILE) as f:
            return json.load(f)
    return {
        "running": False,
        "dartboard": None,
        "current_task": None,
        "tasks_completed": 0,
        "tasks_failed": 0,
        "started_at": None,
        "last_activity": None,
        "failure_mode": "stop",
        "history": []
    }


def save_state(state: dict):
    """Save the current loop state."""
    ensure_state_dir()
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2, default=str)


def start_loop(dartboard: str, failure_mode: str = "stop") -> dict:
    """Start the task execution loop."""
    state = load_state()

    if state["running"]:
        return {
            "success": False,
            "error": "Loop already running",
            "dartboard": state["dartboard"]
        }

    state.update({
        "running": True,
        "dartboard": dartboard,
        "current_task": None,
        "started_at": datetime.now().isoformat(),
        "last_activity": datetime.now().isoformat(),
        "failure_mode": failure_mode,
        "tasks_completed": 0,
        "tasks_failed": 0
    })

    save_state(state)

    return {
        "success": True,
        "message": f"Loop started for dartboard: {dartboard}",
        "failure_mode": failure_mode
    }


def stop_loop(reason: str = "user_request") -> dict:
    """Stop the task execution loop."""
    state = load_state()

    if not state["running"]:
        return {
            "success": False,
            "error": "Loop not running"
        }

    # Add to history
    state["history"].append({
        "dartboard": state["dartboard"],
        "started_at": state["started_at"],
        "stopped_at": datetime.now().isoformat(),
        "tasks_completed": state["tasks_completed"],
        "tasks_failed": state["tasks_failed"],
        "stop_reason": reason
    })

    # Keep only last 10 history entries
    state["history"] = state["history"][-10:]

    state.update({
        "running": False,
        "current_task": None,
        "last_activity": datetime.now().isoformat()
    })

    save_state(state)

    return {
        "success": True,
        "message": "Loop stopped",
        "reason": reason,
        "tasks_completed": state["tasks_completed"],
        "tasks_failed": state["tasks_failed"]
    }


def set_current_task(task_id: str, task_title: str) -> dict:
    """Set the current task being processed."""
    state = load_state()

    if not state["running"]:
        return {
            "success": False,
            "error": "Loop not running"
        }

    state["current_task"] = {
        "id": task_id,
        "title": task_title,
        "started_at": datetime.now().isoformat()
    }
    state["last_activity"] = datetime.now().isoformat()

    save_state(state)

    return {
        "success": True,
        "task_id": task_id,
        "task_title": task_title
    }


def complete_task(task_id: str, success: bool, details: Optional[str] = None) -> dict:
    """Mark a task as completed or failed."""
    state = load_state()

    if success:
        state["tasks_completed"] += 1
    else:
        state["tasks_failed"] += 1

        # Check failure mode
        if state["failure_mode"] == "stop":
            state["running"] = False
            state["history"].append({
                "dartboard": state["dartboard"],
                "started_at": state["started_at"],
                "stopped_at": datetime.now().isoformat(),
                "tasks_completed": state["tasks_completed"],
                "tasks_failed": state["tasks_failed"],
                "stop_reason": f"task_failure: {task_id}"
            })

    state["current_task"] = None
    state["last_activity"] = datetime.now().isoformat()

    save_state(state)

    return {
        "success": True,
        "task_id": task_id,
        "task_success": success,
        "loop_running": state["running"],
        "details": details
    }


def get_status() -> dict:
    """Get the current loop status."""
    state = load_state()

    result = {
        "running": state["running"],
        "dartboard": state["dartboard"],
        "current_task": state["current_task"],
        "tasks_completed": state["tasks_completed"],
        "tasks_failed": state["tasks_failed"],
        "started_at": state["started_at"],
        "last_activity": state["last_activity"],
        "failure_mode": state.get("failure_mode", "stop")
    }

    if state["running"] and state["started_at"]:
        started = datetime.fromisoformat(state["started_at"])
        duration = datetime.now() - started
        result["duration_seconds"] = int(duration.total_seconds())
        result["duration_human"] = str(duration).split(".")[0]

    return result


def get_history() -> list:
    """Get loop execution history."""
    state = load_state()
    return state.get("history", [])


def main():
    """CLI interface for task runner."""
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: task_runner.py <command> [args]"}))
        sys.exit(1)

    command = sys.argv[1]

    try:
        if command == "start":
            dartboard = sys.argv[2] if len(sys.argv) > 2 else None
            failure_mode = sys.argv[3] if len(sys.argv) > 3 else "stop"
            if not dartboard:
                print(json.dumps({"error": "Dartboard name required"}))
                sys.exit(1)
            result = start_loop(dartboard, failure_mode)

        elif command == "stop":
            reason = sys.argv[2] if len(sys.argv) > 2 else "user_request"
            result = stop_loop(reason)

        elif command == "status":
            result = get_status()

        elif command == "history":
            result = get_history()

        elif command == "set-task":
            task_id = sys.argv[2] if len(sys.argv) > 2 else None
            task_title = sys.argv[3] if len(sys.argv) > 3 else ""
            if not task_id:
                print(json.dumps({"error": "Task ID required"}))
                sys.exit(1)
            result = set_current_task(task_id, task_title)

        elif command == "complete-task":
            task_id = sys.argv[2] if len(sys.argv) > 2 else None
            success = sys.argv[3].lower() == "true" if len(sys.argv) > 3 else True
            details = sys.argv[4] if len(sys.argv) > 4 else None
            if not task_id:
                print(json.dumps({"error": "Task ID required"}))
                sys.exit(1)
            result = complete_task(task_id, success, details)

        else:
            result = {"error": f"Unknown command: {command}"}

        print(json.dumps(result, indent=2, default=str))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
