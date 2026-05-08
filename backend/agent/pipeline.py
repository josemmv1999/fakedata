import logging
from typing import AsyncIterator

from agent import MAX_CLAIMS, PREVIEW_MAX_CHARS
from agent.claims import extraer_claims
from agent.extractor import extraer_contenido
from agent.language import analizar_lenguaje
from agent.models import Source, StepId
from agent.search import buscar
from agent.verdict import generar_veredicto

logger = logging.getLogger(__name__)


async def run(entrada: str) -> AsyncIterator[tuple[str, dict]]:
    """Ejecuta el pipeline de verificación.

    Emite tuplas (event_type, payload) en el orden definido por el contrato SSE:
    status → extracted → status → claims → (status → evidence)+ →
    status → language → status → verdict → done. Si algo falla, emite
    un único evento `error` con el step en curso y termina limpio.
    """
    current_step: StepId | None = None
    try:
        current_step = "extract"
        yield ("status", {"step": "extract", "message": "Extrayendo contenido..."})
        texto, url_origen = await extraer_contenido(entrada)
        yield ("extracted", {"url": url_origen, "preview": texto[:PREVIEW_MAX_CHARS]})

        current_step = "claims"
        yield ("status", {"step": "claims", "message": "Extrayendo claims verificables..."})
        claims = await extraer_claims(texto)
        claims = claims[:MAX_CLAIMS]
        yield (
            "claims",
            {"items": [{"text": c.text, "keywords": c.keywords} for c in claims]},
        )

        current_step = "search"
        evidencias: dict[str, list[Source]] = {}
        for claim in claims:
            yield (
                "status",
                {
                    "step": "search",
                    "message": f"Buscando evidencia: {claim.keywords[:80]}",
                },
            )
            sources = await buscar(claim.keywords)
            evidencias[claim.text] = sources
            yield (
                "evidence",
                {
                    "claim": claim.text,
                    "sources": [s.model_dump() for s in sources],
                },
            )

        current_step = "language"
        yield ("status", {"step": "language", "message": "Analizando lenguaje..."})
        analisis = await analizar_lenguaje(texto)
        yield ("language", analisis.model_dump())

        current_step = "verdict"
        yield ("status", {"step": "verdict", "message": "Generando veredicto..."})
        veredicto = await generar_veredicto(texto, claims, evidencias, analisis)
        yield ("verdict", veredicto.model_dump())

        yield ("done", {})
    except Exception as e:
        logger.exception("Pipeline falló en step=%s", current_step)
        yield ("error", {"step": current_step, "message": str(e)})
