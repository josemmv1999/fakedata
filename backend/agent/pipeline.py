import logging
from typing import AsyncIterator

from agent import MAX_CLAIMS, PREVIEW_MAX_CHARS, status_message
from agent.claims import extraer_claims
from agent.extractor import extraer_contenido
from agent.language import analizar_lenguaje
from agent.models import Locale, Source, StepId
from agent.search import buscar
from agent.verdict import generar_veredicto

logger = logging.getLogger(__name__)


async def run(
    entrada: str, locale: Locale = "en"
) -> AsyncIterator[tuple[str, dict]]:
    """Run the verification pipeline.

    Emits ``(event_type, payload)`` tuples in the SSE contract order:
    status → extracted → status → claims → (status → evidence)+ →
    status → language → status → verdict → done. On failure, emits a single
    ``error`` event with the current step and exits cleanly.
    """
    current_step: StepId | None = None
    try:
        current_step = "extract"
        yield ("status", {"step": "extract", "message": status_message("extract", locale)})
        texto, url_origen = await extraer_contenido(entrada)
        yield ("extracted", {"url": url_origen, "preview": texto[:PREVIEW_MAX_CHARS]})

        current_step = "claims"
        yield ("status", {"step": "claims", "message": status_message("claims", locale)})
        claims = await extraer_claims(texto, locale)
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
                    "message": status_message(
                        "search_with_keywords", locale, keywords=claim.keywords[:80]
                    ),
                },
            )
            sources = await buscar(claim.keywords, exclude_url=url_origen)
            evidencias[claim.text] = sources
            yield (
                "evidence",
                {
                    "claim": claim.text,
                    "sources": [s.model_dump() for s in sources],
                },
            )

        current_step = "language"
        yield ("status", {"step": "language", "message": status_message("language", locale)})
        analisis = await analizar_lenguaje(texto, locale)
        yield ("language", analisis.model_dump())

        current_step = "verdict"
        yield ("status", {"step": "verdict", "message": status_message("verdict", locale)})
        veredicto = await generar_veredicto(texto, claims, evidencias, analisis, locale)
        yield ("verdict", veredicto.model_dump())

        yield ("done", {})
    except Exception as e:
        logger.exception("Pipeline failed at step=%s", current_step)
        yield ("error", {"step": current_step, "message": str(e)})
