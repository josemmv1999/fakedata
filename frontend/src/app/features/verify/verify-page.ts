import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';

import { VerificationStore } from '../../core/stores/verification.store';
import { Skeleton } from '../../shared/ui';

import { ClaimsList, type ClaimRow } from './components/claims-list/claims-list';
import { LanguageAnalysisCmp } from './components/language-analysis/language-analysis';
import { ProgressSteps } from './components/progress-steps/progress-steps';
import { VerdictCard } from './components/verdict-card/verdict-card';
import { VerifyInput } from './components/verify-input/verify-input';

@Component({
  selector: 'app-verify-page',
  imports: [
    ClaimsList,
    LanguageAnalysisCmp,
    ProgressSteps,
    Skeleton,
    VerdictCard,
    VerifyInput,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header class="mb-8 max-w-3xl">
        <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
          Verificador de noticias
        </h1>
        <p class="mt-2 text-zinc-600 dark:text-zinc-400">
          Pega una URL o un titular y verifica las afirmaciones contra fuentes
          reales.
        </p>
      </header>

      <div
        class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-10"
      >
        <section class="flex flex-col gap-6 lg:max-w-md">
          <app-verify-input
            [disabled]="store.isStreaming()"
            (verify)="onVerify($event)"
          />

          @if (store.hasStarted()) {
            <app-progress-steps
              [steps]="store.steps()"
              [currentMessage]="store.currentMessage()"
            />
          }

          @if (store.error(); as err) {
            <div
              role="alert"
              class="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-100"
            >
              <strong class="font-semibold">
                Error{{ err.step ? ' (' + err.step + ')' : '' }}:
              </strong>
              {{ err.message }}
            </div>
          }
        </section>

        <section class="flex flex-col gap-6">
          @if (store.verdict(); as v) {
            <app-verdict-card [verdict]="v" />
          } @else if (store.isStreaming() && !store.error()) {
            <app-skeleton height="14rem" />
          }

          @if (mergedClaims().length > 0) {
            <section>
              <h2 class="mb-3 text-xl font-semibold">Afirmaciones</h2>
              <app-claims-list [claims]="mergedClaims()" />
            </section>
          } @else if (store.isStreaming() && !store.error()) {
            <app-skeleton height="6rem" />
          }

          @if (store.language(); as la) {
            <app-language-analysis [analysis]="la" />
          }
        </section>
      </div>
    </div>
  `,
})
export class VerifyPage {
  protected readonly store = inject(VerificationStore);

  protected readonly mergedClaims = computed<ClaimRow[]>(() => {
    const claims = this.store.claimsWithEvidence();
    const evals = this.store.verdict()?.claims_evaluados ?? [];
    const evMap = new Map(evals.map((e) => [e.claim, e] as const));
    return claims.map((c) => ({
      text: c.text,
      keywords: c.keywords,
      sources: c.sources ?? [],
      estado: evMap.get(c.text)?.estado,
      razon: evMap.get(c.text)?.razon,
    }));
  });

  protected onVerify(input: string) {
    void this.store.start(input);
  }
}
