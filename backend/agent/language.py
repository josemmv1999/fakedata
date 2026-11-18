import json
import logging

from agent import chat

from agent import (
    FAST_MODEL,
    LANGUAGE_ANALYSIS_MAX_CHARS,
    LANGUAGE_ANALYSIS_TOKENS,
    LOCALE_NAMES,
    client,
    parse_json_response,
)
from agent.models import LanguageAnalysis, Locale

logger = logging.getLogger(__name__)

_VALID_TONES = {"neutral", "sensational", "propagandistic", "opinionated"}
_VALID_SEVERITIES = {"low", "medium", "high"}


async def analizar_lenguaje(texto: str, locale: Locale = "en") -> LanguageAnalysis:
    locale_name = LOCALE_NAMES.get(locale, "English")

    system_prompt = (
        "You are a journalistic language analysis engine that detects manipulation: "
        "sensationalism, fallacies, emotional appeals, missing sources, "
        "generalizations, ad hominem, clickbait. "
        "You MUST respond with ONLY a valid JSON object — no markdown, no backticks, "
        "no explanation, no text before or after the JSON. "
        "Do not include trailing commas. Do not add comments. "
        f"Free-text values (`type`, `example`) must be written in {locale_name}. "
        "Enum values (`severity`, `tone`) must stay in canonical English. "
        "/no_think"
    )

    user_prompt = (
        f'Text:\n"""{texto[:LANGUAGE_ANALYSIS_MAX_CHARS]}"""\n\n'
        "Analyze the manipulation signals in this text.\n\n"
        "Respond ONLY with this exact JSON structure, nothing else:\n"
        "{\n"
        '  "manipulation_score": <number 0-10>,\n'
        '  "signals": [\n'
        '    {\n'
        '      "type": "short label of the manipulation pattern",\n'
        '      "example": "excerpt or phrase that exemplifies the pattern",\n'
        '      "severity": "low|medium|high"\n'
        '    }\n'
        "  ],\n"
        '  "tone": "neutral|sensational|propagandistic|opinionated"\n'
        "}"
    )

    last_error: Exception | None = None
    for attempt in range(3):
        try:
            raw = await chat(
                model=FAST_MODEL,
                max_tokens=LANGUAGE_ANALYSIS_TOKENS,
                temperature=0.1,
                system= system_prompt,
                user=user_prompt
            )
            logger.debug("language raw response (attempt %d): %s", attempt + 1, raw)
            data = parse_json_response(raw)
            return LanguageAnalysis(**_sanitize(data, stop_reason=None))
        except (json.JSONDecodeError, KeyError, TypeError) as e:
            last_error = e
            logger.warning("language analysis attempt %d failed: %s", attempt + 1, e)

    raise ValueError(
        f"Unexpected model response in language analysis after 3 attempts: {last_error}"
    ) from last_error


def _sanitize(payload: dict, stop_reason: str | None) -> dict:
    """Backfill required fields the model may omit or return with wrong values."""
    if "signals" not in payload or not isinstance(payload.get("signals"), list):
        logger.warning(
            "language analysis missing 'signals' (stop_reason=%s); defaulting to []",
            stop_reason,
        )
        payload["signals"] = []
    else:
        for sig in payload["signals"]:
            if sig.get("severity") not in _VALID_SEVERITIES:
                sig["severity"] = "medium"

    if payload.get("tone") not in _VALID_TONES:
        logger.warning(
            "language analysis missing/invalid 'tone' (stop_reason=%s); defaulting to 'neutral'",
            stop_reason,
        )
        payload["tone"] = "neutral"

    if not isinstance(payload.get("manipulation_score"), (int, float)):
        payload["manipulation_score"] = 0.0

    return payload