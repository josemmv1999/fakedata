"""Verification agent: async pipeline + module-level config and Anthropic client."""

import os

from anthropic import AsyncAnthropic
from dotenv import load_dotenv

load_dotenv()

MODEL = os.getenv("MODEL", "claude-sonnet-4-6")
MAX_CLAIMS = int(os.getenv("MAX_CLAIMS", "5"))

CONTENT_MAX_CHARS = 8000
LANGUAGE_ANALYSIS_MAX_CHARS = 4000
VERDICT_MAX_CHARS = 3000
PREVIEW_MAX_CHARS = 500
WEB_SEARCH_MAX_RESULTS = 5

CLAIM_EXTRACTION_TOKENS = 1024
LANGUAGE_ANALYSIS_TOKENS = 1024
VERDICT_TOKENS = 2048

client = AsyncAnthropic()

from agent.pipeline import run  # noqa: E402  (imported after constants to avoid circular import)

__all__ = ["run", "client", "MODEL", "MAX_CLAIMS"]
