#!/usr/bin/env python3
"""
Track Loop Iteration - SubagentStop hook for task-executor.

This hook fires when dartai:task-executor subagent completes.
Tracks iteration result for the Stop hook to determine next action.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

# Minimal orchestration state - task state lives in Dart
LOOP_FILE = Path(".claude/dartai-loop.json")


def parse_subagent_result():
    """
    Parse the subagent result from stdin or environment.

    The hook receives context about how the subagent stopped.
    """
    result = {
        "status": "unknown",
        "task_id": None,
        "failed_phase": None,
        "blocker": None,
        "uncertainty": None,
        "fix_task_created": False
    }

    # Check environment for subagent context
    subagent_id = os.environ.get("CLAUDE_SUBAGENT_ID", "")
    tool_result = os.environ.get("CLAUDE_TOOL_RESULT", "")

    # Try to parse tool result if available
    if tool_result:
        try:
            data = json.loads(tool_result)
            if isinstance(data, dict):
                # Look for status indicators in the result
                text = data.get("result", "") or data.get("output", "") or str(data)
                text_lower = text.lower()

                if "completed" in text_lower or "success" in text_lower or "done" in text_lower:
                    result["status"] = "success"
                elif "failed" in text_lower or "error" in text_lower:
                    result["status"] = "failed"
                    # Try to extract phase
                    if "phase" in text_lower:
                        result["failed_phase"] = "unknown"  # Would need parsing
                elif "blocked" in text_lower:
                    result["status"] = "blocked"
                    result["blocker"] = text[:200] if len(text) > 200 else text
                elif "uncertain" in text_lower or "unsure" in text_lower or "unclear" in text_lower:
                    result["status"] = "uncertain"
                    result["uncertainty"] = text[:200] if len(text) > 200 else text

                if "fix task" in text_lower or "created subtask" in text_lower:
                    result["fix_task_created"] = True
        except (json.JSONDecodeError, TypeError):
            pass

    # Also try reading from stdin (some hooks pass data this way)
    if result["status"] == "unknown":
        try:
            if not sys.stdin.isatty():
                stdin_data = sys.stdin.read().strip()
                if stdin_data:
                    text_lower = stdin_data.lower()
                    if "success" in text_lower or "completed" in text_lower:
                        result["status"] = "success"
                    elif "failed" in text_lower or "error" in text_lower:
                        result["status"] = "failed"
                    elif "blocked" in text_lower:
                        result["status"] = "blocked"
                    elif "uncertain" in text_lower:
                        result["status"] = "uncertain"
                        result["uncertainty"] = stdin_data[:200]
        except Exception:
            pass

    return result


def track_iteration():
    """Track iteration and result for Stop hook to use."""
    loop = {"iterations": 0, "started_at": None}
    if LOOP_FILE.exists():
        try:
            with open(LOOP_FILE) as f:
                loop = json.load(f)
        except Exception:
            pass

    # Parse what happened in the subagent
    subagent_result = parse_subagent_result()

    # Track orchestration metrics and last result
    loop["iterations"] = loop.get("iterations", 0) + 1
    loop["last_iteration_at"] = datetime.now().isoformat()
    loop["last_subagent"] = os.environ.get("CLAUDE_SUBAGENT_ID", "unknown")
    loop["last_result"] = subagent_result

    LOOP_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(LOOP_FILE, "w") as f:
        json.dump(loop, f, indent=2)

    # Signal based on result
    status = subagent_result["status"]
    if status == "success":
        message = "Task completed. Continue to next task."
    elif status == "failed":
        message = "Task failed. Replan and continue."
    elif status == "blocked":
        message = "Task blocked. Check blocker and replan."
    elif status == "uncertain":
        message = "Agent uncertain. Redo with more context or replan."
    else:
        message = "Subagent done. Check Dart for task status."

    return {
        "success": True,
        "iteration": loop["iterations"],
        "result_status": status,
        "message": message
    }


if __name__ == "__main__":
    print(json.dumps(track_iteration()))
