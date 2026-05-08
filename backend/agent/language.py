import json
import logging

from agent import LANGUAGE_ANALYSIS_MAX_CHARS, LANGUAGE_ANALYSIS_TOKENS, MODEL, client
from agent.models import LanguageAnalysis

logger = logging.getLogger(__name__)


async def analizar_lenguaje(texto: str) -> LanguageAnalysis:
    resp = await client.messages.create(
        model=MODEL,
        max_tokens=LANGUAGE_ANALYSIS_TOKENS,
        system="Analizas lenguaje periodístico para detectar manipulación. Devuelves SOLO JSON.",
        messages=[
            {
                "role": "user",
                "content": f"""Texto:
\"\"\"{texto[:LANGUAGE_ANALYSIS_MAX_CHARS]}\"\"\"

Analiza señales de manipulación: sensacionalismo, falacias, apelaciones emocionales, ausencia de fuentes, generalizaciones, ad hominem, clickbait.

Formato:
{{
  "puntuacion_manipulacion": 0-10,
  "señales": [{{"tipo": "...", "ejemplo": "...", "severidad": "baja|media|alta"}}],
  "tono": "neutral|sensacionalista|propagandistico|opinativo"
}}""",
            }
        ],
    )
    try:
        data = json.loads(resp.content[0].text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Respuesta JSON inválida del modelo al analizar lenguaje: {e}") from e
    return LanguageAnalysis(**data)
