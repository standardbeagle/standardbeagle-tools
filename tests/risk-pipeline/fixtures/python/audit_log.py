"""Append-only audit log writer. Broad blast surface: every mutating route calls it.
Irreversible once flushed to the cold-storage bucket (r=high)."""

from __future__ import annotations

import json
import os
import time
from typing import Any


def write_audit_event(event_type: str, actor: str, payload: dict[str, Any]) -> str:
    """Append an audit event to the current log segment, return event id.

    Every write mutation in the product calls this. Blast high via callers.
    Once the segment rolls and ships to cold storage, events cannot be edited.

    @risk: b!d+s-r+u.
    tagged: 2026-04-21
    model: sonnet
    conf: 0.84
    @risk-why: Called by 60+ routes; ships to immutable cold storage.
    """
    if not event_type or not actor:
        raise ValueError("event_type and actor required")

    record = {
        "ts": time.time(),
        "event_type": event_type,
        "actor": actor,
        "payload": payload,
        "id": _event_id(event_type, actor),
    }
    path = _current_segment_path()
    with open(path, "a", encoding="utf-8") as fh:
        fh.write(json.dumps(record, separators=(",", ":")) + "\n")
    return record["id"]


def _event_id(event_type: str, actor: str) -> str:
    return f"{event_type}:{actor}:{int(time.time() * 1000)}"


def _current_segment_path() -> str:
    root = os.environ.get("AUDIT_LOG_ROOT", "/var/log/audit")
    day = time.strftime("%Y-%m-%d")
    return os.path.join(root, f"events-{day}.jsonl")
