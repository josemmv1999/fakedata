import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

import type { Verdict } from '../../../../models/verification.types';
import { ProgressBar, type ProgressTone } from '../../../../shared/ui';

@Component({
  selector: 'app-verdict-card',
  imports: [ProgressBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      [class]="cardClass()"
      class="rounded-2xl border-2 p-6 shadow-sm transition-colors"
    >
      <header class="flex items-baseline justify-between gap-4">
        <h2 class="text-2xl font-bold tracking-tight sm:text-3xl">
          {{ verdictLabel() }}
        </h2>
        <span class="text-xs font-medium uppercase tracking-wide opacity-70">
          Confianza
        </span>
      </header>
      <div class="mt-4">
        <app-progress-bar [value]="verdict().confianza" [tone]="tone()" />
        <div class="mt-1 text-right text-sm font-mono">
          {{ verdict().confianza }}/100
        </div>
      </div>
      <p class="mt-4 text-base leading-relaxed">{{ verdict().resumen }}</p>

      @if (verdict().banderas_rojas.length > 0) {
        <section class="mt-5">
          <h3 class="text-xs font-semibold uppercase tracking-wide opacity-75">
            Banderas rojas
          </h3>
          <ul class="mt-2 list-disc space-y-1 pl-5 text-sm">
            @for (b of verdict().banderas_rojas; track b) {
              <li>{{ b }}</li>
            }
          </ul>
        </section>
      }

      <section
        class="mt-5 rounded-xl bg-white/40 p-4 dark:bg-zinc-900/40"
      >
        <h3 class="text-xs font-semibold uppercase tracking-wide opacity-75">
          Recomendación
        </h3>
        <p class="mt-1 text-sm leading-relaxed">{{ verdict().recomendacion }}</p>
      </section>
    </article>
  `,
})
export class VerdictCard {
  readonly verdict = input.required<Verdict>();

  protected readonly verdictLabel = computed(
    () =>
      ({
        verdadera: 'Verdadera',
        falsa: 'Falsa',
        parcialmente_verdadera: 'Parcialmente verdadera',
        sin_evidencia_suficiente: 'Sin evidencia suficiente',
      })[this.verdict().veredicto],
  );

  protected readonly cardClass = computed(
    () =>
      ({
        verdadera:
          'border-emerald-500 bg-emerald-50 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100',
        falsa:
          'border-rose-500 bg-rose-50 text-rose-950 dark:bg-rose-950 dark:text-rose-100',
        parcialmente_verdadera:
          'border-amber-500 bg-amber-50 text-amber-950 dark:bg-amber-950 dark:text-amber-100',
        sin_evidencia_suficiente:
          'border-zinc-400 bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100',
      })[this.verdict().veredicto],
  );

  protected readonly tone = computed<ProgressTone>(
    () =>
      ({
        verdadera: 'success' as const,
        falsa: 'danger' as const,
        parcialmente_verdadera: 'warning' as const,
        sin_evidencia_suficiente: 'neutral' as const,
      })[this.verdict().veredicto],
  );
}
