import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';

import { I18nService } from '../../core/i18n/i18n.service';
import { VerificationStore } from '../../core/stores/verification.store';
import { ApiModeSwitcher } from '../../shared/ui/api-mode-switcher/api-mode-switcher';
import { BrandMark } from '../../shared/ui/brand-mark/brand-mark';
import { LocaleSwitcher } from '../../shared/ui/locale-switcher/locale-switcher';
import { SiteFooter } from '../../shared/ui/site-footer/site-footer';
import { ThemeSwitcher } from '../../shared/ui/theme-switcher/theme-switcher';
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
    ApiModeSwitcher,
    BrandMark,
    ClaimsList,
    EmptyState,
    LanguageAnalysisCmp,
    LocaleSwitcher,
    ProgressSteps,
    SiteFooter,
    Skeleton,
    ThemeSwitcher,
    VerdictCard,
    VerifyInput,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-dvh flex-col overflow-x-hidden" id="top">
      <header
        class="sticky top-0 z-20 border-b border-zinc-200/70 bg-white/80 backdrop-blur-md dark:border-zinc-800/70 dark:bg-zinc-950/70"
      >
        <div
          class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"
        >
          <app-brand-mark name="Veritas" size="md" />
          <div class="flex flex-wrap items-center justify-end gap-2">
            <app-api-mode-switcher />
            <app-theme-switcher />
            <app-locale-switcher />
          </div>
        </div>
      </header>

      <main class="flex-1">
        <div
          class="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16"
        >
          <div class="mb-10 max-w-3xl sm:mb-14">
            <h1
              class="break-words font-display text-[2.25rem] font-semibold leading-[1.05] tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl dark:text-zinc-50"
            >
              {{ i18n.t('app.title') }}
            </h1>
            <p
              class="mt-3 max-w-2xl text-base leading-relaxed text-zinc-600 sm:mt-4 sm:text-lg dark:text-zinc-400"
            >
              {{ i18n.t('app.subtitle') }}
            </p>
          </div>

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
                <div id="how-it-works" class="animate-fade-in-up">
                  <app-empty-state (pick)="onVerify($event)" />
                </div>
              } @else {
                @if (store.verdict(); as v) {
                  <div class="animate-fade-in-up">
                    <app-verdict-card [verdict]="v" [cached]="store.cached()" />
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
      </main>

      <app-site-footer />
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
