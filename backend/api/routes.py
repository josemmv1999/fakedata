import logging
from typing import Any, AsyncIterator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from agent import MODEL, run as run_pipeline
from agent.cache import get_cached, hash_input, save_cached
from api.schemas import VerifyRequest
from api.sse import format_event

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")


@router.get("/health")
async def health() -> dict:
    return {"status": "ok"}


def _replay_cached_events(payload: dict[str, Any]) -> list[str]:
    """Build the SSE event sequence that mirrors a fresh run from cached data.

    Status events are intentionally skipped on replay: the frontend treats a
    `cached` event as "skip the timeline animation, jump to results."
    """
    meta = payload.get("_cache_meta") or {}
    out: list[str] = [format_event("cached", meta)]
    if extracted := payload.get("extracted"):
        out.append(format_event("extracted", extracted))
    if claims := payload.get("claims"):
        out.append(format_event("claims", claims))
    for ev in payload.get("evidence", []):
        out.append(format_event("evidence", ev))
    if language := payload.get("language"):
        out.append(format_event("language", language))
    if verdict := payload.get("verdict"):
        out.append(format_event("verdict", verdict))
    out.append(format_event("done", {}))
    return out


@router.post("/verify")
async def verify(req: VerifyRequest) -> StreamingResponse:
    input_hash = hash_input(req.input)

    async def event_stream() -> AsyncIterator[str]:
        try:
            cached = await get_cached(input_hash, req.locale)
            if cached:
                logger.info("Cache HIT  hash=%s locale=%s", input_hash[:12], req.locale)
                for chunk in _replay_cached_events(cached):
                    yield chunk
                return

            logger.info("Cache MISS hash=%s locale=%s", input_hash[:12], req.locale)
            captured: dict[str, Any] = {"evidence": []}
            had_error = False
            async for event_type, payload in run_pipeline(req.input, req.locale):
                yield format_event(event_type, payload)
                if event_type == "extracted":
                    captured["extracted"] = payload
                elif event_type == "claims":
                    captured["claims"] = payload
                elif event_type == "evidence":
                    captured["evidence"].append(payload)
                elif event_type == "language":
                    captured["language"] = payload
                elif event_type == "verdict":
                    captured["verdict"] = payload
                elif event_type == "error":
                    had_error = True

            if not had_error and "verdict" in captured:
                await save_cached(input_hash, req.locale, captured, MODEL)
        except Exception as e:
            logger.exception("Stream falló de forma inesperada")
            yield format_event("error", {"step": None, "message": str(e)})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
