import json
import logging

from agent import (
    LOCALE_NAMES,
    MODEL,
    SNIPPET_MAX_CHARS,
    VERDICT_MAX_CHARS,
    VERDICT_TOKENS,
    client,
    parse_json_response,
)
from agent.models import Claim, LanguageAnalysis, Locale, Source, Verdict

logger = logging.getLogger(__name__)

VERDICT_SCHEMA = """
{
  "verdict": "true|false|partially_true|unverified",
  "confidence": <integer 0-100>,
  "summary": "...",
  "claim_evaluations": [
    {"claim": "...", "status": "confirmed|refuted|unverified", "reason": "..."}
  ],
  "red_flags": ["..."],
  "recommendation": "..."
}
"""


async def generar_veredicto(
    texto: str,
    claims: list[Claim],
    evidencias: dict[str, list[Source]],
    analisis: LanguageAnalysis,
    locale: Locale = "en",
) -> Verdict:
    locale_name = LOCALE_NAMES.get(locale, "English")
    evidencia_str = ""
    for claim_text, fuentes in evidencias.items():
        evidencia_str += f"\n## Claim: {claim_text}\n"
        for s in fuentes:
            evidencia_str += f"- [{s.domain}] {s.title}: {s.snippet[:SNIPPET_MAX_CHARS]}\n"

    resp = await client.messages.create(
        model=MODEL,
        max_tokens=VERDICT_TOKENS,
        system=f"""You are a rigorous fact-checker. You evaluate evidence and emit calibrated verdicts.
Rules:
- If sources are weak or contradictory, use 'unverified'.
- Penalize confidence if source domains are low-quality or unknown.
- Treat the language analysis as a complementary signal, not determinative.
Respond ONLY with JSON matching this schema, no markdown or text outside the object.
Free-text values (`summary`, `reason`, items in `red_flags`, `recommendation`) must be written in {locale_name}; enum values must stay in the canonical English form.
{VERDICT_SCHEMA}""",
        messages=[
            {
                "role": "user",
                "content": f"""Original text:
\"\"\"{texto[:VERDICT_MAX_CHARS]}\"\"\"

Extracted claims: {json.dumps([c.text for c in claims], ensure_ascii=False)}

Collected evidence:
{evidencia_str}

Language analysis:
{analisis.model_dump_json(indent=2)}

Issue the verdict.""",
            }
        ],
    )
    try:
        data = parse_json_response(resp.content[0].text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON from model when generating verdict: {e}") from e
    return Verdict(**data)
