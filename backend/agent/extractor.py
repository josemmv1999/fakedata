import asyncio
import logging

import httpx
from trafilatura import extract

from agent import CONTENT_MAX_CHARS

logger = logging.getLogger(__name__)

# Browser-like User-Agent: bare-bones requests get 403'd by many publishers
# (e.g. elpais.com). httpx also gives us automatic decompression, redirects
# and timeouts for free.
_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)
_HEADERS = {
    "User-Agent": _USER_AGENT,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,es;q=0.8,pt;q=0.7,fr;q=0.6",
    "Cache-Control": "no-cache",
}
_TIMEOUT = 20.0


async def extraer_contenido(entrada: str) -> tuple[str, str | None]:
    """Return (text, source_url). If `entrada` is not a URL, source_url is None."""
    if entrada.startswith(("http://", "https://")):
        return await asyncio.to_thread(_fetch_sync, entrada)
    return entrada, None


def _fetch_sync(url: str) -> tuple[str, str]:
    try:
        with httpx.Client(
            follow_redirects=True,
            timeout=_TIMEOUT,
            headers=_HEADERS,
            http2=False,
        ) as client:
            resp = client.get(url)
    except httpx.TimeoutException as e:
        raise RuntimeError(f"Timed out fetching {url}") from e
    except httpx.RequestError as e:
        raise RuntimeError(f"Network error fetching {url}: {e}") from e

    if resp.status_code >= 400:
        raise RuntimeError(
            f"HTTP {resp.status_code} fetching {url} "
            "(the site may be blocking automated requests or requires login)"
        )

    html = resp.text
    if not html.strip():
        raise RuntimeError(f"Empty response body from {url}")

    text = extract(html, include_comments=False, include_tables=False)
    if not text:
        # Second pass: looser heuristics catch more pages that fail the
        # default 'precision' extraction (e.g. SPA-shells, consent walls).
        text = extract(
            html,
            include_comments=False,
            include_tables=False,
            favor_recall=True,
        )
    if not text:
        raise RuntimeError(
            f"No readable content extracted from {url} "
            "(likely paywalled, JavaScript-rendered, or behind a consent wall)"
        )
    return text[:CONTENT_MAX_CHARS], str(resp.url)
