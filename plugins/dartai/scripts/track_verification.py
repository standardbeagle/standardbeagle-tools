#!/usr/bin/env python3
"""
Track Verification - SubagentStop hook for quality-verifier.

Tracks verification count only - results are in Dart task comments.
"""

import json
import os
from datetime import datetime
from pathlib import Path

LOOP_FILE = Path(".claude/dartai-loop.json")


def track_verification():
    """Track verification count. Results are in Dart task comments."""
    loop = {}
    if LOOP_FILE.exists():
        try:
            with open(LOOP_FILE) as f:
                loop = json.load(f)
        except Exception:
            pass

    loop["verifications"] = loop.get("verifications", 0) + 1
    loop["last_verification_at"] = datetime.now().isoformat()

    LOOP_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(LOOP_FILE, "w") as f:
        json.dump(loop, f, indent=2)

    return {
        "success": True,
        "verifications": loop["verifications"],
        "message": "Verification done. Check Dart task comments for results."
    }


if __name__ == "__main__":
    print(json.dumps(track_verification()))
