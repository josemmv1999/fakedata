import asyncio
import logging
from urllib.parse import urlparse

from ddgs import DDGS

from agent import WEB_SEARCH_MAX_RESULTS
from agent.models import Source

logger = logging.getLogger(__name__)


def _domain(url: str) -> str:
    host = urlparse(url).netloc.lower()
    return host[4:] if host.startswith("www.") else host


async def buscar(keywords: str, exclude_url: str | None = None) -> list[Source]:
    """Search DDG. Results from `exclude_url`'s domain are dropped so the article
    being checked can't be counted as evidence for itself."""
    sources = await asyncio.to_thread(_buscar_sync, keywords)
    if exclude_url:
        excluded = _domain(exclude_url)
        sources = [s for s in sources if _domain(s.url) != excluded]
    return sources


def _buscar_sync(keywords: str) -> list[Source]:
    try:
        with DDGS() as ddgs:
            resultados = list(ddgs.text(keywords, max_results=WEB_SEARCH_MAX_RESULTS))
    except Exception as e:
        logger.warning("Error buscando '%s': %s", keywords, e)
        return []

    return [
        Source(
            url=r["href"],
            title=r["title"],
            snippet=r["body"],
            domain=urlparse(r["href"]).netloc,
        )
        for r in resultados
    ]
