import json
import logging

from agent import MODEL, VERDICT_MAX_CHARS, VERDICT_TOKENS, client
from agent.models import Claim, LanguageAnalysis, Source, Verdict

logger = logging.getLogger(__name__)

VEREDICTO_SCHEMA = """
{
  "veredicto": "verdadera|falsa|parcialmente_verdadera|sin_evidencia_suficiente",
  "confianza": 0-100,
  "resumen": "...",
  "claims_evaluados": [
    {"claim": "...", "estado": "confirmada|refutada|sin_evidencia", "razon": "..."}
  ],
  "banderas_rojas": ["..."],
  "recomendacion": "..."
}
"""


async def generar_veredicto(
    texto: str,
    claims: list[Claim],
    evidencias: dict[str, list[Source]],
    analisis: LanguageAnalysis,
) -> Verdict:
    evidencia_str = ""
    for claim_text, fuentes in evidencias.items():
        evidencia_str += f"\n## Claim: {claim_text}\n"
        for s in fuentes:
            evidencia_str += f"- [{s.domain}] {s.title}: {s.snippet}\n"

    resp = await client.messages.create(
        model=MODEL,
        max_tokens=VERDICT_TOKENS,
        system=f"""Eres un verificador de hechos riguroso. Evalúas evidencia y emites veredictos calibrados.
Reglas:
- Si las fuentes son débiles o contradictorias, usa 'sin_evidencia_suficiente'.
- Penaliza confianza si el dominio de las fuentes es de baja calidad o desconocido.
- Considera el análisis de lenguaje como señal complementaria, no determinante.
Devuelves SOLO JSON con este esquema:
{VEREDICTO_SCHEMA}""",
        messages=[
            {
                "role": "user",
                "content": f"""Texto original:
\"\"\"{texto[:VERDICT_MAX_CHARS]}\"\"\"

Claims extraídos: {json.dumps([c.text for c in claims], ensure_ascii=False)}

Evidencia recopilada:
{evidencia_str}

Análisis de lenguaje:
{analisis.model_dump_json(indent=2)}

Emite el veredicto.""",
            }
        ],
    )
    try:
        data = json.loads(resp.content[0].text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Respuesta JSON inválida del modelo al generar veredicto: {e}") from e
    return Verdict(**data)
