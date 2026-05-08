import logging
from typing import AsyncIterator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from agent import run as run_pipeline
from api.schemas import VerifyRequest
from api.sse import format_event

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")


@router.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@router.post("/verify")
async def verify(req: VerifyRequest) -> StreamingResponse:
    async def event_stream() -> AsyncIterator[str]:
        try:
            async for event_type, payload in run_pipeline(req.input):
                yield format_event(event_type, payload)
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
