import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

import { environment } from '../../../environments/environment';
import type {
  Claim,
  LanguageAnalysis,
  Source,
  StepId,
  Verdict,
} from '../../models/verification.types';
import { SseService } from '../services/sse.service';

const STEP_ORDER: readonly StepId[] = [
  'extract',
  'claims',
  'search',
  'language',
  'verdict',
] as const;

export type StepState = 'pending' | 'active' | 'done' | 'error';
export type RunStatus = 'idle' | 'streaming' | 'done' | 'error';

interface VerificationState {
  status: RunStatus;
  currentStep: StepId | null;
  currentMessage: string;
  stepStates: Record<StepId, StepState>;
  extracted: { url: string | null; preview: string } | null;
  claims: Claim[];
  evidenceByClaim: Record<string, Source[]>;
  language: LanguageAnalysis | null;
  verdict: Verdict | null;
  error: { step: StepId | null; message: string } | null;
}

const INITIAL: VerificationState = {
  status: 'idle',
  currentStep: null,
  currentMessage: '',
  stepStates: {
    extract: 'pending',
    claims: 'pending',
    search: 'pending',
    language: 'pending',
    verdict: 'pending',
  },
  extracted: null,
  claims: [],
  evidenceByClaim: {},
  language: null,
  verdict: null,
  error: null,
};

export const VerificationStore = signalStore(
  { providedIn: 'root' },
  withState<VerificationState>(INITIAL),
  withComputed((state) => ({
    isStreaming: computed(() => state.status() === 'streaming'),
    hasStarted: computed(() => state.status() !== 'idle'),
    steps: computed(() =>
      STEP_ORDER.map((id) => ({ id, state: state.stepStates()[id] })),
    ),
    claimsWithEvidence: computed<Claim[]>(() => {
      const ev = state.evidenceByClaim();
      return state
        .claims()
        .map((c) => ({ ...c, sources: ev[c.text] ?? [] }));
    }),
  })),
  withMethods((store) => {
    const sse = inject(SseService);

    function transitionTo(step: StepId, message: string) {
      const next: Record<StepId, StepState> = { ...store.stepStates() };
      const target = STEP_ORDER.indexOf(step);
      for (let i = 0; i < STEP_ORDER.length; i++) {
        const id = STEP_ORDER[i];
        if (i < target) next[id] = 'done';
        else if (i === target && next[id] !== 'error') next[id] = 'active';
      }
      patchState(store, {
        currentStep: step,
        currentMessage: message,
        stepStates: next,
      });
    }

    function markAllDone() {
      const next: Record<StepId, StepState> = { ...store.stepStates() };
      for (const id of STEP_ORDER) {
        if (next[id] !== 'error') next[id] = 'done';
      }
      patchState(store, {
        currentStep: null,
        currentMessage: '',
        stepStates: next,
      });
    }

    function markErrorStep(step: StepId | null) {
      if (!step) return;
      patchState(store, {
        stepStates: { ...store.stepStates(), [step]: 'error' as StepState },
      });
    }

    return {
      reset() {
        patchState(store, INITIAL);
      },

      async start(input: string) {
        patchState(store, { ...INITIAL, status: 'streaming' });
        try {
          for await (const ev of sse.stream(`${environment.apiUrl}/verify`, {
            input,
          })) {
            switch (ev.event) {
              case 'status':
                transitionTo(ev.data.step, ev.data.message);
                break;
              case 'extracted':
                patchState(store, { extracted: ev.data });
                break;
              case 'claims':
                patchState(store, {
                  claims: ev.data.items.map((i) => ({
                    text: i.text,
                    keywords: i.keywords,
                  })),
                });
                break;
              case 'evidence':
                patchState(store, {
                  evidenceByClaim: {
                    ...store.evidenceByClaim(),
                    [ev.data.claim]: ev.data.sources,
                  },
                });
                break;
              case 'language':
                patchState(store, { language: ev.data });
                break;
              case 'verdict':
                patchState(store, { verdict: ev.data });
                break;
              case 'error':
                markErrorStep(ev.data.step);
                patchState(store, { status: 'error', error: ev.data });
                break;
              case 'done':
                markAllDone();
                patchState(store, { status: 'done' });
                break;
            }
          }
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          patchState(store, {
            status: 'error',
            error: { step: store.currentStep(), message },
          });
        }
      },
    };
  }),
);
