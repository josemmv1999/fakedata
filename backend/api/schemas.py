import re

from pydantic import BaseModel, field_validator

from agent.models import Locale, SUPPORTED_LOCALES

_URL_RE = re.compile(r"^https?://[^\s]+$", re.IGNORECASE)
_MIN_TEXT_CHARS = 10


class VerifyRequest(BaseModel):
    input: str
    locale: Locale = "en"

    @field_validator("input")
    @classmethod
    def validate_input(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Input cannot be empty")
        if v.startswith(("http://", "https://")):
            if not _URL_RE.match(v):
                raise ValueError("Invalid URL")
            return v
        if len(v) < _MIN_TEXT_CHARS:
            raise ValueError(
                f"Text must be at least {_MIN_TEXT_CHARS} characters if it is not a URL"
            )
        return v


__all__ = ["VerifyRequest", "SUPPORTED_LOCALES"]
