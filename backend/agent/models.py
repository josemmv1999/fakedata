# Mantener sincronizado con shared/verification.types.ts (copia espejo manual).

from typing import Literal

from pydantic import BaseModel, Field

StepId = Literal["extract", "claims", "search", "language", "verdict"]
Severity = Literal["baja", "media", "alta"]
Tone = Literal["neutral", "sensacionalista", "propagandistico", "opinativo"]
VerdictType = Literal[
    "verdadera", "falsa", "parcialmente_verdadera", "sin_evidencia_suficiente"
]
ClaimStatus = Literal["confirmada", "refutada", "sin_evidencia"]


class Source(BaseModel):
    url: str
    title: str
    domain: str
    snippet: str


class Claim(BaseModel):
    text: str
    keywords: str
    sources: list[Source] | None = None


class ManipulationSignal(BaseModel):
    tipo: str
    ejemplo: str
    severidad: Severity


class LanguageAnalysis(BaseModel):
    puntuacion_manipulacion: float = Field(ge=0, le=10)
    señales: list[ManipulationSignal]
    tono: Tone


class ClaimEvaluation(BaseModel):
    claim: str
    estado: ClaimStatus
    razon: str


class Verdict(BaseModel):
    veredicto: VerdictType
    confianza: int = Field(ge=0, le=100)
    resumen: str
    claims_evaluados: list[ClaimEvaluation]
    banderas_rojas: list[str]
    recomendacion: str
