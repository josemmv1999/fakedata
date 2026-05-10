"""Verification agent: async pipeline + module-level config and Anthropic client."""

import json
import os

from anthropic import AsyncAnthropic
from dotenv import load_dotenv

load_dotenv()

MODEL = os.getenv("MODEL", "claude-sonnet-4-6")
FAST_MODEL = os.getenv("FAST_MODEL", "claude-haiku-4-5-20251001")
MAX_CLAIMS = int(os.getenv("MAX_CLAIMS", "5"))

CONTENT_MAX_CHARS = 4000
LANGUAGE_ANALYSIS_MAX_CHARS = 2000
VERDICT_MAX_CHARS = 2000
PREVIEW_MAX_CHARS = 500
WEB_SEARCH_MAX_RESULTS = 5
SNIPPET_MAX_CHARS = 400

CLAIM_EXTRACTION_TOKENS = 512
LANGUAGE_ANALYSIS_TOKENS = 1024
VERDICT_TOKENS = 2048

client = AsyncAnthropic()


LOCALE_NAMES: dict[str, str] = {
    "en": "English",
    "es": "Spanish",
    "pt": "Portuguese",
    "fr": "French",
}


# Curated list of reputable outlets the verdict can recommend for further
# verification. The MODEL picks names from this list (so it can't hallucinate
# domains); we attach the URL server-side. Each list mixes generalist news
# agencies (Reuters/AP/AFP) with the locale's strongest outlets and dedicated
# fact-checkers when available.
TRUSTED_SOURCES: dict[str, list[dict[str, str]]] = {
    "en": [
        {"name": "Reuters", "url": "https://www.reuters.com"},
        {"name": "Associated Press", "url": "https://apnews.com"},
        {"name": "BBC News", "url": "https://www.bbc.com/news"},
        {"name": "The Guardian", "url": "https://www.theguardian.com"},
        {"name": "AFP Fact Check", "url": "https://factcheck.afp.com"},
        {"name": "PolitiFact", "url": "https://www.politifact.com"},
        {"name": "Snopes", "url": "https://www.snopes.com"},
        {"name": "FactCheck.org", "url": "https://www.factcheck.org"},
    ],
    "es": [
        {"name": "El País", "url": "https://elpais.com"},
        {"name": "RTVE Noticias", "url": "https://www.rtve.es/noticias"},
        {"name": "Agencia EFE", "url": "https://efe.com"},
        {"name": "Newtral", "url": "https://www.newtral.es"},
        {"name": "Maldita.es", "url": "https://maldita.es"},
        {"name": "Verificat", "url": "https://www.verificat.cat"},
        {"name": "Reuters", "url": "https://www.reuters.com"},
        {"name": "BBC Mundo", "url": "https://www.bbc.com/mundo"},
    ],
    "pt": [
        {"name": "Público", "url": "https://www.publico.pt"},
        {"name": "RTP Notícias", "url": "https://www.rtp.pt/noticias"},
        {"name": "Agência Lusa", "url": "https://www.lusa.pt"},
        {"name": "Polígrafo", "url": "https://poligrafo.sapo.pt"},
        {"name": "Observador", "url": "https://observador.pt"},
        {"name": "BBC News Brasil", "url": "https://www.bbc.com/portuguese"},
        {"name": "Reuters", "url": "https://www.reuters.com"},
    ],
    "fr": [
        {"name": "Le Monde", "url": "https://www.lemonde.fr"},
        {"name": "AFP Factuel", "url": "https://factuel.afp.com"},
        {"name": "France 24", "url": "https://www.france24.com"},
        {"name": "Les Décodeurs (Le Monde)", "url": "https://www.lemonde.fr/les-decodeurs"},
        {"name": "Libération CheckNews", "url": "https://www.liberation.fr/checknews"},
        {"name": "Reuters", "url": "https://www.reuters.com"},
        {"name": "BBC Afrique", "url": "https://www.bbc.com/afrique"},
    ],
}

# Localized pipeline status messages. Keys aligned with StepId; the special
# "search_with_keywords" template formats `{keywords}` into the message.
STATUS_MESSAGES: dict[str, dict[str, str]] = {
    "extract": {
        "en": "Extracting content…",
        "es": "Extrayendo contenido…",
        "pt": "Extraindo conteúdo…",
        "fr": "Extraction du contenu…",
    },
    "claims": {
        "en": "Extracting verifiable claims…",
        "es": "Extrayendo afirmaciones verificables…",
        "pt": "Extraindo afirmações verificáveis…",
        "fr": "Extraction des affirmations vérifiables…",
    },
    "search_with_keywords": {
        "en": "Searching evidence: {keywords}",
        "es": "Buscando evidencia: {keywords}",
        "pt": "Procurando evidências: {keywords}",
        "fr": "Recherche de preuves: {keywords}",
    },
    "language": {
        "en": "Analyzing language…",
        "es": "Analizando lenguaje…",
        "pt": "Analisando linguagem…",
        "fr": "Analyse du langage…",
    },
    "verdict": {
        "en": "Generating verdict…",
        "es": "Generando veredicto…",
        "pt": "Gerando veredicto…",
        "fr": "Génération du verdict…",
    },
}


def status_message(key: str, locale: str, **fmt: str) -> str:
    """Look up a localized status message, falling back to English."""
    bundle = STATUS_MESSAGES.get(key, {})
    template = bundle.get(locale) or bundle.get("en") or ""
    return template.format(**fmt) if fmt else template


def parse_json_response(text: str) -> dict:
    """Parse JSON from a Claude response, tolerando fences markdown y pre/post-ámbulo.

    Estrategia: 1) intenta parsear el texto trimmed; 2) si lleva ```...``` lo
    elimina; 3) si aún falla, recorta del primer `{` al último `}` y reintenta.
    Si nada parsea, propaga ``json.JSONDecodeError``.
    """
    s = text.strip()
    if s.startswith("```"):
        first_nl = s.find("\n")
        if first_nl != -1:
            s = s[first_nl + 1 :]
        if s.rstrip().endswith("```"):
            s = s.rstrip()[:-3].rstrip()
        s = s.strip()
    try:
        return json.loads(s)
    except json.JSONDecodeError:
        first = s.find("{")
        last = s.rfind("}")
        if first == -1 or last == -1 or last < first:
            raise
        return json.loads(s[first : last + 1])


from agent.pipeline import run  # noqa: E402  (imported after constants to avoid circular import)

__all__ = [
    "run",
    "client",
    "MODEL",
    "FAST_MODEL",
    "MAX_CLAIMS",
    "LOCALE_NAMES",
    "STATUS_MESSAGES",
    "TRUSTED_SOURCES",
    "parse_json_response",
    "status_message",
]
