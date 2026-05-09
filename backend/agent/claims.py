import json
import logging

from agent import (
    CLAIM_EXTRACTION_TOKENS,
    LOCALE_NAMES,
    MAX_CLAIMS,
    MODEL,
    client,
    parse_json_response,
)
from agent.models import Claim, Locale

logger = logging.getLogger(__name__)


async def extraer_claims(texto: str, locale: Locale = "en") -> list[Claim]:
    locale_name = LOCALE_NAMES.get(locale, "English")
    resp = await client.messages.create(
        model=MODEL,
        max_tokens=CLAIM_EXTRACTION_TOKENS,
        system=(
            "You extract verifiable claims from a text. Respond ONLY with valid JSON, "
            "no markdown or text outside the object. Both `text` and `keywords` must be "
            f"written in {locale_name}."
        ),
        messages=[
            {
                "role": "user",
                "content": f"""Text:
\"\"\"{texto}\"\"\"

Return up to {MAX_CLAIMS} factual verifiable claims (not opinions). For each, generate an optimized search query (concise keywords, no punctuation).

Format:
{{"claims": [{{"text": "...", "keywords": "..."}}]}}""",
            }
        ],
    )
    try:
        data = parse_json_response(resp.content[0].text)
        return [Claim(**c) for c in data["claims"]]
    except (json.JSONDecodeError, KeyError) as e:
        raise ValueError(f"Unexpected model response while extracting claims: {e}") from e
