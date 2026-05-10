import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';

import { I18nService } from '../../../../core/i18n/i18n.service';
import type {
  LanguageAnalysis,
  Severity,
} from '../../../../models/verification.types';
import {
  Badge,
  type BadgeTone,
  ProgressBar,
  type ProgressTone,
} from '../../../../shared/ui';

@Component({
  selector: 'app-language-analysis',
  imports: [Badge, ProgressBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="rounded-2xl border border-zinc-200/80 bg-white/90 p-6 shadow-sm shadow-black/[0.02] backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:shadow-black/30"
    >
      <header
        class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <h3 class="font-display text-xl font-semibold tracking-tight">
          {{ i18n.t('language.title') }}
        </h3>
        <app-badge [tone]="toneTone()">{{ toneLabel() }}</app-badge>
      </header>

      <div class="mt-5 flex items-end gap-5">
        <div>
          <p
            class="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400"
          >
            {{ i18n.t('language.score') }}
          </p>
          <p
            [class]="scoreColor()"
            class="font-display text-5xl font-semibold tabular-nums leading-none transition-colors"
          >
            {{ analysis().manipulation_score.toFixed(1) }}<span
              class="ml-1 text-xl text-zinc-400 dark:text-zinc-500"
              >/10</span
            >
          </p>
        </div>
        <div class="flex-1 pb-2">
          <app-progress-bar
            [value]="analysis().manipulation_score * 10"
            [tone]="manipulationTone()"
          />
        </div>
      </div>

      @if (analysis().signals.length > 0) {
        <ul class="mt-5 flex flex-col gap-2">
          @for (s of analysis().signals; track s.type + s.example) {
            <li
              class="flex items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-800/40"
            >
              <app-badge [tone]="severityTone(s.severity)">
                {{ i18n.t('language.severity.' + s.severity) }}
              </app-badge>
              <div class="flex-1">
                <p class="font-medium leading-tight">{{ s.type }}</p>
                <p
                  class="mt-1 text-sm leading-snug text-zinc-600 dark:text-zinc-400"
                >
                  «{{ s.example }}»
                </p>
              </div>
            </li>
          }
        </ul>
      } @else {
        <p class="mt-5 text-sm italic text-zinc-500">
          {{ i18n.t('language.noSignals') }}
        </p>
      }
    </section>
  `,
})
export class LanguageAnalysisCmp {
  protected readonly i18n = inject(I18nService);

  readonly analysis = input.required<LanguageAnalysis>();

  protected readonly toneLabel = computed(() =>
    this.i18n.t(`language.tone.${this.analysis().tone}`),
  );

  protected readonly toneTone = computed<BadgeTone>(
    () =>
      ({
        neutral: 'success' as const,
        opinionated: 'neutral' as const,
        sensational: 'warning' as const,
        propagandistic: 'danger' as const,
      })[this.analysis().tone],
  );

  protected readonly manipulationTone = computed<ProgressTone>(() => {
    const s = this.analysis().manipulation_score;
    if (s < 3) return 'success';
    if (s < 7) return 'warning';
    return 'danger';
  });

  protected readonly scoreColor = computed(() => {
    const s = this.analysis().manipulation_score;
    if (s < 3) return 'text-emerald-600 dark:text-emerald-400';
    if (s < 7) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  });

  protected severityTone(s: Severity): BadgeTone {
    return ({ low: 'neutral', medium: 'warning', high: 'danger' } as const)[s];
  }
}
