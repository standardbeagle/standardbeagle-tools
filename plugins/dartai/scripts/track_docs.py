#!/usr/bin/env python3
"""
Track Docs - SubagentStop hook for doc-updater.

Tracks doc update count only - details in Dart task comments.
"""

import json
from datetime import datetime
from pathlib import Path

LOOP_FILE = Path(".claude/dartai-loop.json")


def track_docs():
    """Track doc update count."""
    loop = {}
    if LOOP_FILE.exists():
        try:
            with open(LOOP_FILE) as f:
                loop = json.load(f)
        except Exception:
            pass

    loop["doc_updates"] = loop.get("doc_updates", 0) + 1
    loop["last_doc_update_at"] = datetime.now().isoformat()

    LOOP_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(LOOP_FILE, "w") as f:
        json.dump(loop, f, indent=2)

    return {"success": True, "doc_updates": loop["doc_updates"]}


if __name__ == "__main__":
    print(json.dumps(track_docs()))
