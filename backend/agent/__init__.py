"""Verification agent: async pipeline + module-level config and Anthropic client."""

import json
import logging
import os

from anthropic import AsyncAnthropic
from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()

logger = logging.getLogger(__name__)

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

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "anthropic").lower()

if LLM_PROVIDER == "ollama":
    client = AsyncOpenAI(
        api_key="ollama",
        base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1"),
    )
    MODEL = os.getenv("OLLAMA_MODEL", "hf.co/bartowski/Qwen_Qwen3-14B-GGUF:Q4_K_M")
    FAST_MODEL = os.getenv("OLLAMA_FAST_MODEL", "hf.co/bartowski/Qwen_Qwen3.5-9B-GGUF:Q4_K_M")
    logger.info("LLM provider: Ollama | model=%s | fast=%s", MODEL, FAST_MODEL)

elif LLM_PROVIDER == "anthropic":
    client = AsyncAnthropic(
        api_key=os.getenv("ANTHROPIC_API_KEY"),
    )
    MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6")
    FAST_MODEL = os.getenv("ANTHROPIC_FAST_MODEL", "claude-haiku-4-5-20251001")
    logger.info("LLM provider: Anthropic | model=%s | fast=%s", MODEL, FAST_MODEL)

else:
    raise ValueError(f"Unknown LLM_PROVIDER={LLM_PROVIDER!r}. Must be 'anthropic' or 'ollama'.")


async def chat(
    model: str,
    system: str,
    user: str,
    max_tokens: int,
    temperature: float = 0.1,
) -> str:
    """Unified chat call — works transparently with both Anthropic and Ollama."""
    if LLM_PROVIDER == "ollama":
        resp = await client.chat.completions.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
        )
        return resp.choices[0].message.content

    else:  # anthropic
        resp = await client.messages.create(
            model=model,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        return resp.content[0].text


LOCALE_NAMES: dict[str, str] = {
    "en": "English",
    "es": "Spanish",
    "pt": "Portuguese",
    "fr": "French",
}

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
    """Parse JSON from a model response, tolerating markdown fences and preamble."""
    s = text.strip()
    if s.startswith("```"):
        first_nl = s.find("\n")
        if first_nl != -1:
            s = s[first_nl + 1:]
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
        return json.loads(s[first: last + 1])


from agent.pipeline import run  # noqa: E402

__all__ = [
    "run",
    "chat",
    "client",
    "LLM_PROVIDER",
    "MODEL",
    "FAST_MODEL",
    "MAX_CLAIMS",
    "LOCALE_NAMES",
    "STATUS_MESSAGES",
    "TRUSTED_SOURCES",
    "parse_json_response",
    "status_message",
]