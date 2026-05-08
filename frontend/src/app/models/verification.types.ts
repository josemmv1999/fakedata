// Mirror manual de /shared/verification.types.ts. Mantener idéntico.

export type StepId = 'extract' | 'claims' | 'search' | 'language' | 'verdict';
export type Severity = 'baja' | 'media' | 'alta';
export type Tone =
  | 'neutral'
  | 'sensacionalista'
  | 'propagandistico'
  | 'opinativo';
export type VerdictType =
  | 'verdadera'
  | 'falsa'
  | 'parcialmente_verdadera'
  | 'sin_evidencia_suficiente';
export type ClaimStatus = 'confirmada' | 'refutada' | 'sin_evidencia';

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
  tipo: string;
  ejemplo: string;
  severidad: Severity;
}

export interface LanguageAnalysis {
  puntuacion_manipulacion: number;
  señales: ManipulationSignal[];
  tono: Tone;
}

export interface ClaimEvaluation {
  claim: string;
  estado: ClaimStatus;
  razon: string;
}

export interface Verdict {
  veredicto: VerdictType;
  confianza: number;
  resumen: string;
  claims_evaluados: ClaimEvaluation[];
  banderas_rojas: string[];
  recomendacion: string;
}

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
