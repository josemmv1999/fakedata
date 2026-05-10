"""Mock backend: identical SSE contract to api.main, zero Anthropic/DDG calls.

Run alongside the real API to develop the frontend without burning tokens:

    uv run uvicorn mock_api:app --port 8001 --reload

Then point the frontend at it by editing `frontend/src/environments/environment.ts`
(`apiUrl: 'http://localhost:8001/api'`) or by running both ports in parallel.

The verdict shape varies by hash of the input so the UI can be tested across
all four verdict types (true / false / partially_true / unverified) by sending
different inputs.
"""

from __future__ import annotations

import asyncio
import logging
from hashlib import md5
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from agent import status_message
from agent.models import Locale, VerdictType
from api.schemas import VerifyRequest
from api.sse import format_event

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="Verificador de hechos (mock)", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Step pacing (seconds). Tuned so the UI feels alive but tests are fast.
DELAY_EXTRACT = 0.4
DELAY_CLAIMS = 0.6
DELAY_SEARCH = 0.5
DELAY_LANGUAGE = 0.5
DELAY_VERDICT = 0.7


VERDICTS_CYCLE: tuple[VerdictType, ...] = ("true", "partially_true", "false", "unverified")


def _pick_verdict(seed: str) -> VerdictType:
    """Deterministic but input-dependent so the UI can be tested across states."""
    h = int(md5(seed.encode("utf-8")).hexdigest(), 16)
    return VERDICTS_CYCLE[h % len(VERDICTS_CYCLE)]


def _fake_claims(locale: Locale) -> list[dict]:
    by_locale: dict[Locale, list[dict]] = {
        "en": [
            {"text": "The new policy reduces emissions by 40% in five years.", "keywords": "new policy emissions 40 percent five years"},
            {"text": "Over 200,000 jobs will be created in the renewable sector.", "keywords": "200000 jobs renewable sector"},
            {"text": "The budget allocation triples last year's figure.", "keywords": "budget allocation triples previous year"},
        ],
        "es": [
            {"text": "La nueva política reduce las emisiones un 40% en cinco años.", "keywords": "nueva política emisiones 40 por ciento cinco años"},
            {"text": "Se crearán más de 200.000 empleos en el sector renovable.", "keywords": "200000 empleos sector renovable"},
            {"text": "La asignación presupuestaria triplica la del año pasado.", "keywords": "presupuesto triplica año anterior"},
        ],
        "pt": [
            {"text": "A nova política reduz as emissões em 40% em cinco anos.", "keywords": "nova política emissões 40 por cento cinco anos"},
            {"text": "Mais de 200.000 empregos serão criados no setor renovável.", "keywords": "200000 empregos setor renovável"},
            {"text": "A dotação orçamental triplica a do ano passado.", "keywords": "orçamento triplica ano anterior"},
        ],
        "fr": [
            {"text": "La nouvelle politique réduit les émissions de 40% en cinq ans.", "keywords": "nouvelle politique émissions 40 pour cent cinq ans"},
            {"text": "Plus de 200 000 emplois seront créés dans le secteur renouvelable.", "keywords": "200000 emplois secteur renouvelable"},
            {"text": "L'enveloppe budgétaire triple celle de l'an dernier.", "keywords": "budget triple année précédente"},
        ],
    }
    return by_locale.get(locale, by_locale["en"])


def _fake_sources(claim_text: str) -> list[dict]:
    return [
        {
            "url": "https://reuters.com/article/example-policy-emissions",
            "title": "Government unveils ambitious emissions plan",
            "domain": "reuters.com",
            "snippet": "The plan, presented on Tuesday, sets a binding target of 40% reduction by 2030 across all major industrial sectors.",
        },
        {
            "url": "https://apnews.com/article/policy-emissions-budget",
            "title": "Lawmakers approve budget aligned with new climate goals",
            "domain": "apnews.com",
            "snippet": "The bill triples last year's allocation, channeling funds to grid modernization and workforce retraining programs.",
        },
        {
            "url": "https://example-blog.org/post/independent-analysis",
            "title": "Independent analysis: are the targets realistic?",
            "domain": "example-blog.org",
            "snippet": "Experts disagree on whether the timeline can be met without additional regulation, citing supply chain bottlenecks.",
        },
    ]


def _fake_language(locale: Locale) -> dict:
    examples: dict[Locale, dict] = {
        "en": {"type": "Loaded language", "example": "“an unprecedented victory for the planet”"},
        "es": {"type": "Lenguaje cargado", "example": "«una victoria sin precedentes para el planeta»"},
        "pt": {"type": "Linguagem carregada", "example": "«uma vitória sem precedentes para o planeta»"},
        "fr": {"type": "Langage chargé", "example": "« une victoire sans précédent pour la planète »"},
    }
    e = examples.get(locale, examples["en"])
    return {
        "manipulation_score": 4.5,
        "signals": [
            {"type": e["type"], "example": e["example"], "severity": "medium"},
            {"type": "Missing source", "example": "“200,000 jobs”", "severity": "low"},
        ],
        "tone": "sensational",
    }


def _fake_verdict(verdict: VerdictType, locale: Locale, claim_texts: list[str]) -> dict:
    by_locale: dict[Locale, dict] = {
        "en": {
            "summary": "Most figures align with primary sources, but at least one claim lacks a verifiable trail.",
            "red_flags": ["Round numbers presented without uncertainty range", "Tone leans promotional in places"],
            "recommendation": "Cross-check the jobs figure with the official press release before sharing.",
            "further_reading": [
                {"name": "Reuters", "url": "https://www.reuters.com", "rationale": "International newswire with reliable coverage of public-policy announcements."},
                {"name": "Associated Press", "url": "https://apnews.com", "rationale": "Independent reporting on government budget figures and labor market data."},
                {"name": "AFP Fact Check", "url": "https://factcheck.afp.com", "rationale": "Has fact-checked similar climate-policy claims in the past."},
            ],
        },
        "es": {
            "summary": "La mayoría de las cifras coinciden con fuentes primarias, pero al menos una afirmación carece de rastro verificable.",
            "red_flags": ["Números redondos presentados sin margen de incertidumbre", "El tono se inclina en partes hacia lo promocional"],
            "recommendation": "Contrasta la cifra de empleo con la nota de prensa oficial antes de compartir.",
            "further_reading": [
                {"name": "El País", "url": "https://elpais.com", "rationale": "Cobertura económica y de política climática con verificación editorial."},
                {"name": "RTVE Noticias", "url": "https://www.rtve.es/noticias", "rationale": "Servicio público con acceso a comunicados oficiales del Gobierno."},
                {"name": "Newtral", "url": "https://www.newtral.es", "rationale": "Verifica habitualmente cifras de creación de empleo en sectores estratégicos."},
            ],
        },
        "pt": {
            "summary": "A maioria dos números coincide com fontes primárias, mas pelo menos uma afirmação não tem rasto verificável.",
            "red_flags": ["Números redondos apresentados sem margem de incerteza", "O tom inclina-se por vezes para o promocional"],
            "recommendation": "Confirme o número de empregos com o comunicado oficial antes de partilhar.",
            "further_reading": [
                {"name": "Público", "url": "https://www.publico.pt", "rationale": "Cobertura aprofundada de política ambiental e dados orçamentais."},
                {"name": "RTP Notícias", "url": "https://www.rtp.pt/noticias", "rationale": "Serviço público com acesso direto a comunicados governamentais."},
                {"name": "Polígrafo", "url": "https://poligrafo.sapo.pt", "rationale": "Fact-checker independente que tem analisado promessas semelhantes."},
            ],
        },
        "fr": {
            "summary": "La plupart des chiffres correspondent à des sources primaires, mais au moins une affirmation n'a pas de trace vérifiable.",
            "red_flags": ["Chiffres ronds présentés sans marge d'incertitude", "Le ton penche par endroits vers le promotionnel"],
            "recommendation": "Recoupez le chiffre d'emplois avec le communiqué officiel avant de partager.",
            "further_reading": [
                {"name": "Le Monde", "url": "https://www.lemonde.fr", "rationale": "Couverture détaillée des politiques climatiques et budgétaires."},
                {"name": "AFP Factuel", "url": "https://factuel.afp.com", "rationale": "Vérifie régulièrement les annonces d'emplois liés à la transition écologique."},
                {"name": "Les Décodeurs (Le Monde)", "url": "https://www.lemonde.fr/les-decodeurs", "rationale": "Spécialisés dans l'analyse de chiffres officiels."},
            ],
        },
    }
    base = by_locale.get(locale, by_locale["en"])

    confidence_by_verdict: dict[VerdictType, int] = {
        "true": 84,
        "partially_true": 62,
        "false": 78,
        "unverified": 35,
    }
    status_for: dict[VerdictType, list[str]] = {
        "true": ["confirmed", "confirmed", "confirmed"],
        "partially_true": ["confirmed", "unverified", "refuted"],
        "false": ["refuted", "refuted", "unverified"],
        "unverified": ["unverified", "unverified", "unverified"],
    }
    reason_by_status: dict[Locale, dict[str, str]] = {
        "en": {
            "confirmed": "Multiple primary sources match the claim within the stated margin.",
            "refuted": "Primary sources contradict the figure cited in the claim.",
            "unverified": "No reliable source confirms or denies this number.",
        },
        "es": {
            "confirmed": "Varias fuentes primarias coinciden con la afirmación dentro del margen indicado.",
            "refuted": "Las fuentes primarias contradicen la cifra citada.",
            "unverified": "Ninguna fuente fiable confirma ni desmiente este dato.",
        },
        "pt": {
            "confirmed": "Várias fontes primárias coincidem com a afirmação dentro da margem indicada.",
            "refuted": "As fontes primárias contradizem o número citado.",
            "unverified": "Nenhuma fonte fiável confirma ou desmente este dado.",
        },
        "fr": {
            "confirmed": "Plusieurs sources primaires correspondent à l'affirmation dans la marge indiquée.",
            "refuted": "Les sources primaires contredisent le chiffre cité.",
            "unverified": "Aucune source fiable ne confirme ou n'infirme ce chiffre.",
        },
    }
    statuses = status_for[verdict]
    reasons = reason_by_status.get(locale, reason_by_status["en"])

    return {
        "verdict": verdict,
        "confidence": confidence_by_verdict[verdict],
        "summary": base["summary"],
        "claim_evaluations": [
            {"claim": text, "status": statuses[i], "reason": reasons[statuses[i]]}
            for i, text in enumerate(claim_texts)
        ],
        "red_flags": base["red_flags"],
        "recommendation": base["recommendation"],
        "further_reading": base["further_reading"],
    }


async def _emit(event: str, payload: dict | None = None) -> str:
    return format_event(event, payload if payload is not None else {})


async def mock_pipeline(req: VerifyRequest) -> AsyncIterator[str]:
    locale = req.locale
    is_url = req.input.startswith(("http://", "https://"))

    # 1. extract
    yield await _emit("status", {"step": "extract", "message": status_message("extract", locale)})
    await asyncio.sleep(DELAY_EXTRACT)
    yield await _emit(
        "extracted",
        {
            "url": req.input if is_url else None,
            "preview": (
                "Mock article excerpt. The pipeline emits this preview after the "
                "extraction step succeeds. Use the real backend for actual content."
            ),
        },
    )

    # 2. claims
    yield await _emit("status", {"step": "claims", "message": status_message("claims", locale)})
    await asyncio.sleep(DELAY_CLAIMS)
    claims = _fake_claims(locale)
    yield await _emit("claims", {"items": claims})

    # 3. search (one event per claim)
    for c in claims:
        yield await _emit(
            "status",
            {
                "step": "search",
                "message": status_message("search_with_keywords", locale, keywords=c["keywords"]),
            },
        )
        await asyncio.sleep(DELAY_SEARCH)
        yield await _emit("evidence", {"claim": c["text"], "sources": _fake_sources(c["text"])})

    # 4. language
    yield await _emit("status", {"step": "language", "message": status_message("language", locale)})
    await asyncio.sleep(DELAY_LANGUAGE)
    yield await _emit("language", _fake_language(locale))

    # 5. verdict
    yield await _emit("status", {"step": "verdict", "message": status_message("verdict", locale)})
    await asyncio.sleep(DELAY_VERDICT)
    verdict_type = _pick_verdict(req.input)
    yield await _emit(
        "verdict",
        _fake_verdict(verdict_type, locale, [c["text"] for c in claims]),
    )

    yield await _emit("done")


@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok", "mode": "mock"}


@app.post("/api/verify")
async def verify(req: VerifyRequest) -> StreamingResponse:
    async def event_stream() -> AsyncIterator[str]:
        try:
            async for chunk in mock_pipeline(req):
                yield chunk
        except Exception as e:  # pragma: no cover  (defensive parity with real api)
            logger.exception("Mock stream falló")
            yield format_event("error", {"step": None, "message": str(e)})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
