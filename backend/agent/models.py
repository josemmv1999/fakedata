# Keep in sync with shared/verification.types.ts (manual mirror).

from typing import Literal

from pydantic import BaseModel, Field

Locale = Literal["en", "es", "pt", "fr"]
SUPPORTED_LOCALES: tuple[Locale, ...] = ("en", "es", "pt", "fr")

StepId = Literal["extract", "claims", "search", "language", "verdict"]
Severity = Literal["low", "medium", "high"]
Tone = Literal["neutral", "sensational", "propagandistic", "opinionated"]
VerdictType = Literal["true", "false", "partially_true", "unverified"]
ClaimStatus = Literal["confirmed", "refuted", "unverified"]


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
    type: str
    example: str
    severity: Severity


class LanguageAnalysis(BaseModel):
    manipulation_score: float = Field(ge=0, le=10)
    signals: list[ManipulationSignal]
    tone: Tone


class ClaimEvaluation(BaseModel):
    claim: str
    status: ClaimStatus
    reason: str


class Verdict(BaseModel):
    verdict: VerdictType
    confidence: int = Field(ge=0, le=100)
    summary: str
    claim_evaluations: list[ClaimEvaluation]
    red_flags: list[str]
    recommendation: str
