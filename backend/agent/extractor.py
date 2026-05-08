import asyncio
import logging

from trafilatura import extract, fetch_url

from agent import CONTENT_MAX_CHARS

logger = logging.getLogger(__name__)


async def extraer_contenido(entrada: str) -> tuple[str, str | None]:
    """Devuelve (texto, url_origen). Si entrada no es URL, url_origen=None."""
    if entrada.startswith(("http://", "https://")):
        return await asyncio.to_thread(_fetch_sync, entrada)
    return entrada, None


def _fetch_sync(url: str) -> tuple[str, str]:
    html = fetch_url(url)
    if not html:
        raise RuntimeError(f"No se pudo descargar la URL: {url}")
    texto = extract(html, include_comments=False, include_tables=False)
    if not texto:
        raise RuntimeError(f"No se pudo extraer contenido legible de: {url}")
    return texto[:CONTENT_MAX_CHARS], url
