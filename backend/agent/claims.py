import json
import logging

from agent import chat

from agent import (
    CLAIM_EXTRACTION_TOKENS,
    FAST_MODEL,
    LOCALE_NAMES,
    MAX_CLAIMS,
    client,
    parse_json_response,
)
from agent.models import Claim, Locale

logger = logging.getLogger(__name__)


async def extraer_claims(texto: str, locale: Locale = "en") -> list[Claim]:
    locale_name = LOCALE_NAMES.get(locale, "English")

    system_prompt = (
        "You are a claim extraction engine. "
        "You MUST respond with ONLY a valid JSON object — no markdown, no backticks, "
        "no explanation, no text before or after the JSON. "
        "Do not include trailing commas. Do not add comments. "
        f"Both `text` and `keywords` must be written in {locale_name}. "
        "/no_think"
    )

    user_prompt = (
        f'Text:\n"""{texto}"""\n\n'
        f"Extract up to {MAX_CLAIMS} factual verifiable claims (not opinions). "
        "For each claim, generate concise search keywords (no punctuation, no quotes).\n\n"
        "Respond ONLY with this exact JSON structure, nothing else:\n"
        f'{{"claims": [{{"text": "claim text here", "keywords": "search keywords here"}}]}}'
    )

    last_error: Exception | None = None
    for attempt in range(3):
        try:
            raw = await chat(
                model=FAST_MODEL,
                max_tokens=CLAIM_EXTRACTION_TOKENS,
                temperature=0.1,  # low temp = more deterministic, fewer JSON errors
                user=user_prompt,
                system=system_prompt
            )
            logger.debug("claims raw response (attempt %d): %s", attempt + 1, raw)
            data = parse_json_response(raw)
            return [Claim(**c) for c in data["claims"]]
        except (json.JSONDecodeError, KeyError, TypeError) as e:
            last_error = e
            logger.warning("claims attempt %d failed: %s", attempt + 1, e)

    raise ValueError(
        f"Unexpected model response while extracting claims after 3 attempts: {last_error}"
    ) from last_error