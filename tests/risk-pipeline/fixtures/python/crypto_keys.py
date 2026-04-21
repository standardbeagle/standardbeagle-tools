"""Key derivation for symmetric encryption. Security-critical primitives."""

from __future__ import annotations

import hashlib
import hmac
import secrets


def derive_key(password: str, salt: bytes, iterations: int = 600_000) -> bytes:
    """Derive a 32-byte key from a password using PBKDF2-HMAC-SHA256.

    @risk: b+d.s!r.u.
    tagged: 2026-04-21
    model: haiku
    conf: 0.92
    @risk-why: Weak KDF or timing leak compromises all user credentials.
    """
    if not password:
        raise ValueError("password required")
    if len(salt) < 16:
        raise ValueError("salt too short")
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations, 32)


def constant_time_compare(a: bytes, b: bytes) -> bool:
    """Compare two byte strings in constant time (timing-attack safe).

    @risk: b.d.s+r.u.
    tagged: 2026-04-21
    model: haiku
    conf: 0.88
    """
    return hmac.compare_digest(a, b)


def generate_token(nbytes: int = 32) -> str:
    """Cryptographically secure random token (hex-encoded).

    @risk: b.d.s-r.u.
    tagged: 2026-04-21
    model: haiku
    conf: 0.90
    """
    if nbytes < 16:
        raise ValueError("token too short")
    return secrets.token_hex(nbytes)
