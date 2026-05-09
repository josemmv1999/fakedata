"""SQLite cache for completed verifications.

A successful pipeline run is captured as a JSON blob keyed by
``(input_hash, locale)``. Subsequent requests with the same input hit the
cache and skip the entire pipeline (no Anthropic, no DDG calls).

Hashing rules (see ``normalize_input``): URLs are lower-cased, ``www.`` is
stripped, common tracking params (``utm_*``, ``fbclid``, etc.) are dropped;
free text is lower-cased and whitespace-collapsed. The point is that obvious
equivalents land on the same row without being too aggressive.
"""

from __future__ import annotations

import hashlib
import json
import logging
import os
import re
import time
from typing import Any
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

import aiosqlite

logger = logging.getLogger(__name__)

CACHE_DB_PATH = os.getenv("CACHE_DB_PATH", "cache.db")
CACHE_TTL_HOURS = int(os.getenv("CACHE_TTL_HOURS", "168"))  # 7 days
CACHE_ENABLED = os.getenv("CACHE_ENABLED", "true").lower() not in ("0", "false", "no")

_TRACKING_PARAMS = frozenset(
    {
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
        "utm_id",
        "fbclid",
        "gclid",
        "mc_cid",
        "mc_eid",
        "ref",
        "ref_src",
        "_ga",
        "yclid",
        "msclkid",
    }
)
_WS_RE = re.compile(r"\s+")


def normalize_input(text: str) -> str:
    """Canonical form of an input for hashing. Stable across trivial variants."""
    text = text.strip()
    if text.startswith(("http://", "https://")):
        try:
            p = urlparse(text)
            host = p.netloc.lower()
            if host.startswith("www."):
                host = host[4:]
            scheme = p.scheme.lower()
            qs = [
                (k, v)
                for k, v in parse_qsl(p.query, keep_blank_values=True)
                if k.lower() not in _TRACKING_PARAMS
            ]
            qs.sort()
            path = p.path.rstrip("/") or "/"
            return urlunparse((scheme, host, path, "", urlencode(qs), ""))
        except Exception:
            return text.lower()
    return _WS_RE.sub(" ", text.lower())


def hash_input(text: str) -> str:
    """SHA-256 hex digest of the normalized input."""
    return hashlib.sha256(normalize_input(text).encode("utf-8")).hexdigest()


async def init_db() -> None:
    """Create the cache table if it doesn't exist. Safe to call repeatedly."""
    if not CACHE_ENABLED:
        logger.info("Cache disabled (CACHE_ENABLED=false), skipping init")
        return
    async with aiosqlite.connect(CACHE_DB_PATH) as db:
        await db.execute(
            """
            CREATE TABLE IF NOT EXISTS verifications (
                input_hash TEXT NOT NULL,
                locale TEXT NOT NULL,
                payload TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                model TEXT NOT NULL,
                PRIMARY KEY (input_hash, locale)
            )
            """
        )
        await db.execute(
            "CREATE INDEX IF NOT EXISTS idx_verifications_created_at "
            "ON verifications(created_at)"
        )
        await db.commit()
    logger.info("Cache initialized at %s (TTL %sh)", CACHE_DB_PATH, CACHE_TTL_HOURS)


async def get_cached(input_hash: str, locale: str) -> dict[str, Any] | None:
    """Return the cached payload (with `_cache_meta`) if a non-expired row exists."""
    if not CACHE_ENABLED:
        return None
    cutoff = int(time.time()) - CACHE_TTL_HOURS * 3600
    try:
        async with aiosqlite.connect(CACHE_DB_PATH) as db:
            async with db.execute(
                "SELECT payload, created_at, model FROM verifications "
                "WHERE input_hash = ? AND locale = ? AND created_at >= ?",
                (input_hash, locale, cutoff),
            ) as cur:
                row = await cur.fetchone()
    except Exception:
        logger.exception("Cache read failed; treating as miss")
        return None
    if not row:
        return None
    payload_str, created_at, model = row
    try:
        payload = json.loads(payload_str)
    except json.JSONDecodeError:
        logger.exception("Corrupted cache row, ignoring")
        return None
    payload["_cache_meta"] = {
        "created_at": int(created_at),
        "age_seconds": max(0, int(time.time()) - int(created_at)),
        "model": model,
    }
    return payload


async def save_cached(
    input_hash: str, locale: str, payload: dict[str, Any], model: str
) -> None:
    """Persist a successful pipeline run. Failures are logged, never raised."""
    if not CACHE_ENABLED:
        return
    now = int(time.time())
    try:
        async with aiosqlite.connect(CACHE_DB_PATH) as db:
            await db.execute(
                "INSERT OR REPLACE INTO verifications "
                "(input_hash, locale, payload, created_at, model) "
                "VALUES (?, ?, ?, ?, ?)",
                (input_hash, locale, json.dumps(payload, ensure_ascii=False), now, model),
            )
            await db.commit()
    except Exception:
        logger.exception("Cache write failed; pipeline result not cached")
