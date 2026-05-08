import asyncio
import logging
from urllib.parse import urlparse

from ddgs import DDGS

from agent import WEB_SEARCH_MAX_RESULTS
from agent.models import Source

logger = logging.getLogger(__name__)


async def buscar(keywords: str) -> list[Source]:
    return await asyncio.to_thread(_buscar_sync, keywords)


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
