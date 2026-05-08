import re

from pydantic import BaseModel, field_validator

_URL_RE = re.compile(r"^https?://[^\s]+$", re.IGNORECASE)
_MIN_TEXT_CHARS = 10


class VerifyRequest(BaseModel):
    input: str

    @field_validator("input")
    @classmethod
    def validate_input(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("El input no puede estar vacío")
        if v.startswith(("http://", "https://")):
            if not _URL_RE.match(v):
                raise ValueError("URL inválida")
            return v
        if len(v) < _MIN_TEXT_CHARS:
            raise ValueError(
                f"El texto debe tener al menos {_MIN_TEXT_CHARS} caracteres si no es una URL"
            )
        return v
