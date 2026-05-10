import json
import logging

from agent import (
    LOCALE_NAMES,
    MODEL,
    SNIPPET_MAX_CHARS,
    TRUSTED_SOURCES,
    VERDICT_MAX_CHARS,
    VERDICT_TOKENS,
    client,
)
from agent.models import Claim, LanguageAnalysis, Locale, Source, Verdict

logger = logging.getLogger(__name__)


# Forcing a tool call via `tool_choice` makes the API validate the response
# against this schema before returning it, so we no longer have to parse
# free-form JSON that the model may emit with stray commas, unescaped quotes,
# or trailing prose.
VERDICT_TOOL = {
    "name": "issue_verdict",
    "description": (
        "Issue the calibrated fact-check verdict for the article, given the "
        "extracted claims, the evidence collected for each, and the language "
        "analysis."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "verdict": {
                "type": "string",
                "enum": ["true", "false", "partially_true", "unverified"],
            },
            "confidence": {
                "type": "integer",
                "minimum": 0,
                "maximum": 100,
                "description": "Confidence in the verdict, 0-100.",
            },
            "summary": {
                "type": "string",
                "description": "One-paragraph rationale for the verdict.",
            },
            "claim_evaluations": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "claim": {"type": "string"},
                        "status": {
                            "type": "string",
                            "enum": ["confirmed", "refuted", "unverified"],
                        },
                        "reason": {"type": "string"},
                    },
                    "required": ["claim", "status", "reason"],
                },
            },
            "red_flags": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Concrete warning signs spotted in the article.",
            },
            "recommendation": {
                "type": "string",
                "description": "Actionable recommendation to the reader.",
            },
            "further_reading": {
                "type": "array",
                "minItems": 0,
                "maxItems": 5,
                "description": (
                    "Up to 5 reputable outlets the reader can consult to verify "
                    "the article independently. The `name` MUST match one of the "
                    "outlets listed in the system prompt verbatim — do NOT invent "
                    "outlets or domains. Pick those most relevant to the article's "
                    "topic; if none of the listed outlets fits, return an empty array."
                ),
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string",
                            "description": "Outlet name, copied verbatim from the curated list.",
                        },
                        "rationale": {
                            "type": "string",
                            "description": "One-sentence justification for why THIS outlet is relevant to THIS article's claims.",
                        },
                    },
                    "required": ["name", "rationale"],
                },
            },
        },
        "required": [
            "verdict",
            "confidence",
            "summary",
            "claim_evaluations",
            "red_flags",
            "recommendation",
        ],
    },
}


async def generar_veredicto(
    texto: str,
    claims: list[Claim],
    evidencias: dict[str, list[Source]],
    analisis: LanguageAnalysis,
    locale: Locale = "en",
) -> Verdict:
    locale_name = LOCALE_NAMES.get(locale, "English")
    trusted = TRUSTED_SOURCES.get(locale) or TRUSTED_SOURCES["en"]
    trusted_names_block = "\n".join(f"- {s['name']}" for s in trusted)
    name_to_url = {s["name"]: s["url"] for s in trusted}

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

IMPORTANT — two distinct enums, do NOT mix them:
- Overall `verdict`: true | false | partially_true | unverified (four values).
- Per-claim `claim_evaluations[].status`: confirmed | refuted | unverified (three values, NEVER 'partially_true' or 'true'/'false'). If a single claim is only partially supported, mark it 'unverified'.

For `further_reading`: pick 3-5 outlets from the list below that are most relevant to the article's topic. Copy the `name` VERBATIM (case and punctuation) — do NOT invent outlets or alter spelling. If the topic doesn't fit any of these outlets, return an empty array.

Trusted outlets the reader can cross-check against:
{trusted_names_block}

You MUST respond by calling the `issue_verdict` tool. Do not write any prose outside the tool call.
Free-text values (`summary`, `reason`, items in `red_flags`, `recommendation`, `further_reading[].rationale`) must be written in {locale_name}; enum values must stay in the canonical English form.""",
        tools=[VERDICT_TOOL],
        tool_choice={"type": "tool", "name": "issue_verdict"},
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

    for block in resp.content:
        if getattr(block, "type", None) == "tool_use" and block.name == "issue_verdict":
            return Verdict(**_sanitize(block.input, name_to_url))

    raise ValueError(
        f"Model did not call the issue_verdict tool (stop_reason={resp.stop_reason})"
    )


_VALID_CLAIM_STATUSES = {"confirmed", "refuted", "unverified"}


def _sanitize(payload: dict, name_to_url: dict[str, str]) -> dict:
    """Coerce model slip-ups before pydantic validation.

    - Per-claim status: any value outside {confirmed, refuted, unverified}
      becomes 'unverified' (the model sometimes leaks the overall-verdict enum).
    - further_reading: drop entries whose `name` is not in the curated list
      (guards against hallucinated outlets) and attach the canonical URL.
    """
    evals = payload.get("claim_evaluations") or []
    for ev in evals:
        status = ev.get("status")
        if status not in _VALID_CLAIM_STATUSES:
            logger.warning(
                "Coercing invalid claim status %r -> 'unverified'", status
            )
            ev["status"] = "unverified"

    raw_reading = payload.get("further_reading") or []
    cleaned: list[dict] = []
    for item in raw_reading:
        name = (item.get("name") or "").strip()
        rationale = (item.get("rationale") or "").strip()
        if not name or not rationale:
            continue
        url = name_to_url.get(name)
        if not url:
            logger.warning("Dropping further_reading entry with unknown outlet %r", name)
            continue
        cleaned.append({"name": name, "url": url, "rationale": rationale})
    payload["further_reading"] = cleaned

    return payload
