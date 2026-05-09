import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';

import { I18nService } from '../../core/i18n/i18n.service';
import { VerificationStore } from '../../core/stores/verification.store';
import { LocaleSwitcher } from '../../shared/ui/locale-switcher/locale-switcher';
import { Skeleton } from '../../shared/ui';

import { ClaimsList, type ClaimRow } from './components/claims-list/claims-list';
import { EmptyState } from './components/empty-state/empty-state';
import { LanguageAnalysisCmp } from './components/language-analysis/language-analysis';
import { ProgressSteps } from './components/progress-steps/progress-steps';
import { VerdictCard } from './components/verdict-card/verdict-card';
import { VerifyInput } from './components/verify-input/verify-input';

@Component({
  selector: 'app-verify-page',
  imports: [
    ClaimsList,
    EmptyState,
    LanguageAnalysisCmp,
    LocaleSwitcher,
    ProgressSteps,
    Skeleton,
    VerdictCard,
    VerifyInput,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative isolate min-h-dvh">
      <!-- Decorative blur orbs -->
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-x-0 top-0 -z-10 overflow-hidden"
      >
        <div
          class="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-300/40 via-fuchsia-300/30 to-transparent blur-3xl dark:from-blue-700/20 dark:via-fuchsia-700/20"
        ></div>
        <div
          class="absolute right-0 top-32 h-72 w-72 rounded-full bg-emerald-300/25 blur-3xl dark:bg-emerald-700/15"
        ></div>
      </div>

      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <header
          class="mb-8 flex flex-col-reverse items-start gap-4 sm:mb-12 sm:flex-row sm:items-start sm:justify-between"
        >
          <div class="max-w-3xl">
            <h1
              class="font-display text-[2.25rem] font-semibold leading-[1.05] tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl dark:text-zinc-50"
            >
              {{ i18n.t('app.title') }}
            </h1>
            <p
              class="mt-3 max-w-2xl text-base leading-relaxed text-zinc-600 sm:mt-4 sm:text-lg dark:text-zinc-400"
            >
              {{ i18n.t('app.subtitle') }}
            </p>
          </div>
          <app-locale-switcher class="self-end sm:self-start" />
        </header>

        <div
          class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-12"
        >
          <section class="flex flex-col gap-6 lg:max-w-md">
            <app-verify-input
              [disabled]="store.isStreaming()"
              (verify)="onVerify($event)"
            />

            @if (store.hasStarted()) {
              <div class="animate-fade-in-up">
                <app-progress-steps
                  [steps]="store.steps()"
                  [currentMessage]="store.currentMessage()"
                />
              </div>
            }

            @if (store.error(); as err) {
              <div
                role="alert"
                class="animate-fade-in-up rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-sm text-rose-900 backdrop-blur dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-100"
              >
                <p class="font-semibold">
                  {{ i18n.t('error.prefix')
                  }}{{ err.step ? ' (' + err.step + ')' : '' }}
                </p>
                <p class="mt-1 leading-relaxed">{{ err.message }}</p>
              </div>
            }
          </section>

          <section class="flex flex-col gap-6">
            @if (!store.hasStarted()) {
              <div class="animate-fade-in-up">
                <app-empty-state (pick)="onVerify($event)" />
              </div>
            } @else {
              @if (store.verdict(); as v) {
                <div class="animate-fade-in-up">
                  <app-verdict-card [verdict]="v" />
                </div>
              } @else if (store.isStreaming() && !store.error()) {
                <app-skeleton height="14rem" />
              }

              @if (mergedClaims().length > 0) {
                <section class="animate-fade-in-up">
                  <h2
                    class="mb-4 font-display text-2xl font-semibold tracking-tight"
                  >
                    {{ i18n.t('claims.title') }}
                  </h2>
                  <app-claims-list [claims]="mergedClaims()" />
                </section>
              } @else if (store.isStreaming() && !store.error()) {
                <app-skeleton height="6rem" />
              }

              @if (store.language(); as la) {
                <div class="animate-fade-in-up">
                  <app-language-analysis [analysis]="la" />
                </div>
              }
            }
          </section>
        </div>
      </div>
    </div>
  `,
})
export class VerifyPage {
  protected readonly store = inject(VerificationStore);
  protected readonly i18n = inject(I18nService);

  protected readonly mergedClaims = computed<ClaimRow[]>(() => {
    const claims = this.store.claimsWithEvidence();
    const evals = this.store.verdict()?.claim_evaluations ?? [];
    const evMap = new Map(evals.map((e) => [e.claim, e] as const));
    return claims.map((c) => ({
      text: c.text,
      keywords: c.keywords,
      sources: c.sources ?? [],
      status: evMap.get(c.text)?.status,
      reason: evMap.get(c.text)?.reason,
    }));
  });

  protected onVerify(input: string) {
    void this.store.start(input, this.i18n.locale());
  }
}
