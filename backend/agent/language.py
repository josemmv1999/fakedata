import json
import logging

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


async def analizar_lenguaje(texto: str, locale: Locale = "en") -> LanguageAnalysis:
    locale_name = LOCALE_NAMES.get(locale, "English")
    resp = await client.messages.create(
        model=FAST_MODEL,
        max_tokens=LANGUAGE_ANALYSIS_TOKENS,
        system=(
            "You analyze journalistic language to detect manipulation. Respond ONLY "
            "with JSON, no markdown or text outside the object. Free-text values "
            f"(`type`, `example`) must be written in {locale_name}; enum values must "
            "stay in the canonical English form."
        ),
        messages=[
            {
                "role": "user",
                "content": f"""Text:
\"\"\"{texto[:LANGUAGE_ANALYSIS_MAX_CHARS]}\"\"\"

Analyze manipulation signals: sensationalism, fallacies, emotional appeals, missing sources, generalizations, ad hominem, clickbait.

Format (use these exact JSON keys and enum values):
{{
  "manipulation_score": <number 0-10>,
  "signals": [{{"type": "<short label>", "example": "<quoted excerpt>", "severity": "low|medium|high"}}],
  "tone": "neutral|sensational|propagandistic|opinionated"
}}""",
            },
        ],
    )
    try:
        data = parse_json_response(resp.content[0].text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON from model during language analysis: {e}") from e
    return LanguageAnalysis(**data)
