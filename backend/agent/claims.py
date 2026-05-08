import json
import logging

from agent import CLAIM_EXTRACTION_TOKENS, MAX_CLAIMS, MODEL, client
from agent.models import Claim

logger = logging.getLogger(__name__)


async def extraer_claims(texto: str) -> list[Claim]:
    resp = await client.messages.create(
        model=MODEL,
        max_tokens=CLAIM_EXTRACTION_TOKENS,
        system="Extraes afirmaciones verificables de un texto. Devuelves SOLO JSON válido, sin markdown.",
        messages=[
            {
                "role": "user",
                "content": f"""Texto:
\"\"\"{texto}\"\"\"

Devuelve hasta {MAX_CLAIMS} afirmaciones factuales verificables (no opiniones). Para cada una, genera una query de búsqueda optimizada (keywords concisas, sin signos).

Formato:
{{"claims": [{{"text": "...", "keywords": "..."}}]}}""",
            }
        ],
    )
    try:
        data = json.loads(resp.content[0].text)
        return [Claim(**c) for c in data["claims"]]
    except (json.JSONDecodeError, KeyError) as e:
        raise ValueError(f"Respuesta inesperada del modelo al extraer claims: {e}") from e
