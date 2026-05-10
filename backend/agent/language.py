import logging

from agent import (
    FAST_MODEL,
    LANGUAGE_ANALYSIS_MAX_CHARS,
    LANGUAGE_ANALYSIS_TOKENS,
    LOCALE_NAMES,
    client,
)
from agent.models import LanguageAnalysis, Locale

logger = logging.getLogger(__name__)


# Forced tool_use → API validates the response shape, no JSON parsing.
LANGUAGE_TOOL = {
    "name": "analyze_language",
    "description": (
        "Emit a manipulation analysis of the article's journalistic language: "
        "score, signals (type + example + severity), and overall tone."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "manipulation_score": {
                "type": "number",
                "minimum": 0,
                "maximum": 10,
            },
            "signals": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "type": {
                            "type": "string",
                            "description": "Short label of the manipulation pattern.",
                        },
                        "example": {
                            "type": "string",
                            "description": "Excerpt or phrase that exemplifies the pattern.",
                        },
                        "severity": {
                            "type": "string",
                            "enum": ["low", "medium", "high"],
                        },
                    },
                    "required": ["type", "example", "severity"],
                },
            },
            "tone": {
                "type": "string",
                "enum": ["neutral", "sensational", "propagandistic", "opinionated"],
            },
        },
        "required": ["manipulation_score", "signals", "tone"],
    },
}


async def analizar_lenguaje(texto: str, locale: Locale = "en") -> LanguageAnalysis:
    locale_name = LOCALE_NAMES.get(locale, "English")
    resp = await client.messages.create(
        model=FAST_MODEL,
        max_tokens=LANGUAGE_ANALYSIS_TOKENS,
        system=(
            "You analyze journalistic language to detect manipulation: "
            "sensationalism, fallacies, emotional appeals, missing sources, "
            "generalizations, ad hominem, clickbait. "
            "You MUST respond by calling the `analyze_language` tool. "
            f"Free-text values (`type`, `example`) must be written in {locale_name} — "
            "if the source article is in another language, TRANSLATE the example "
            "phrase into "
            f"{locale_name} rather than quoting it verbatim, so the UI reads "
            "consistently. Enum values (`severity`, `tone`) must stay in the "
            "canonical English form."
        ),
        tools=[LANGUAGE_TOOL],
        tool_choice={"type": "tool", "name": "analyze_language"},
        messages=[
            {
                "role": "user",
                "content": (
                    f'Text:\n"""{texto[:LANGUAGE_ANALYSIS_MAX_CHARS]}"""\n\n'
                    "Analyze the manipulation signals."
                ),
            },
        ],
    )

    for block in resp.content:
        if getattr(block, "type", None) == "tool_use" and block.name == "analyze_language":
            return LanguageAnalysis(**_sanitize(block.input, resp.stop_reason))

    raise ValueError(
        f"Model did not call the analyze_language tool (stop_reason={resp.stop_reason})"
    )


_VALID_TONES = {"neutral", "sensational", "propagandistic", "opinionated"}
_VALID_SEVERITIES = {"low", "medium", "high"}


def _sanitize(payload: dict, stop_reason: str | None) -> dict:
    """Backfill required fields the model may omit (e.g. on max_tokens cut-off).

    Anthropic enforces tool input_schemas loosely, so on a truncated response
    we may see `{"manipulation_score": 7.5}` with `signals` and `tone` missing.
    Rather than fail the whole pipeline, fall back to safe defaults and warn.
    """
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
