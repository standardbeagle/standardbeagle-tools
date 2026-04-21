"""Simple in-memory LRU cache helper. No I/O, no external deps."""

from __future__ import annotations

from collections import OrderedDict
from typing import Any


class Cache:
    """Bounded in-memory LRU cache.

    @risk: b.d.s.r.u.
    tagged: 2026-04-21
    model: haiku
    conf: 0.93
    """

    def __init__(self, maxsize: int = 128) -> None:
        self._store: "OrderedDict[str, Any]" = OrderedDict()
        self._maxsize = maxsize

    def get(self, key: str) -> Any | None:
        """Return cached value for key, or None if absent.

        @risk: b.d.s.r.u.
        tagged: 2026-04-21
        model: haiku
        conf: 0.95
        """
        if key not in self._store:
            return None
        self._store.move_to_end(key)
        return self._store[key]

    def put(self, key: str, value: Any) -> None:
        """Store value under key; evicts oldest when over maxsize.

        @risk: b.d.s.r.u.
        tagged: 2026-04-21
        model: haiku
        conf: 0.94
        """
        if key in self._store:
            self._store.move_to_end(key)
        self._store[key] = value
        if len(self._store) > self._maxsize:
            self._store.popitem(last=False)
