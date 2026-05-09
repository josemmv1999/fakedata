// Canonical backend ↔ frontend contract.
// The backend mirrors this in backend/agent/models.py (pydantic).
// The frontend mirrors this in frontend/src/app/models/verification.types.ts.
// Any change must be propagated to all three files.

export type Locale = 'en' | 'es' | 'pt' | 'fr';
export const SUPPORTED_LOCALES: readonly Locale[] = [
  'en',
  'es',
  'pt',
  'fr',
] as const;

export type StepId = 'extract' | 'claims' | 'search' | 'language' | 'verdict';
export type Severity = 'low' | 'medium' | 'high';
export type Tone =
  | 'neutral'
  | 'sensational'
  | 'propagandistic'
  | 'opinionated';
export type VerdictType = 'true' | 'false' | 'partially_true' | 'unverified';
export type ClaimStatus = 'confirmed' | 'refuted' | 'unverified';

export interface Source {
  url: string;
  title: string;
  domain: string;
  snippet: string;
}

export interface Claim {
  text: string;
  keywords: string;
  sources?: Source[];
}

export interface ManipulationSignal {
  type: string;
  example: string;
  severity: Severity;
}

export interface LanguageAnalysis {
  manipulation_score: number;
  signals: ManipulationSignal[];
  tone: Tone;
}

export interface ClaimEvaluation {
  claim: string;
  status: ClaimStatus;
  reason: string;
}

export interface Verdict {
  verdict: VerdictType;
  confidence: number;
  summary: string;
  claim_evaluations: ClaimEvaluation[];
  red_flags: string[];
  recommendation: string;
}

// ── SSE events ─────────────────────────────────────────────────────────────
export interface StatusPayload {
  step: StepId;
  message: string;
}
export interface ExtractedPayload {
  url: string | null;
  preview: string;
}
export interface ClaimsPayload {
  items: { text: string; keywords: string }[];
}
export interface EvidencePayload {
  claim: string;
  sources: Source[];
}
export interface ErrorPayload {
  step: StepId | null;
  message: string;
}

export type VerificationEvent =
  | { event: 'status'; data: StatusPayload }
  | { event: 'extracted'; data: ExtractedPayload }
  | { event: 'claims'; data: ClaimsPayload }
  | { event: 'evidence'; data: EvidencePayload }
  | { event: 'language'; data: LanguageAnalysis }
  | { event: 'verdict'; data: Verdict }
  | { event: 'error'; data: ErrorPayload }
  | { event: 'done'; data: Record<string, never> };
