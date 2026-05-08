import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

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
      class="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <header
        class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <h3 class="text-lg font-semibold">Análisis de lenguaje</h3>
        <app-badge [tone]="toneTone()">{{ toneLabel() }}</app-badge>
      </header>
      <div class="mt-4">
        <div class="mb-1 flex items-center justify-between text-sm">
          <span class="text-zinc-700 dark:text-zinc-300">
            Puntuación de manipulación
          </span>
          <span class="font-mono">
            {{ analysis().puntuacion_manipulacion.toFixed(1) }}/10
          </span>
        </div>
        <app-progress-bar
          [value]="analysis().puntuacion_manipulacion * 10"
          [tone]="manipulacionTone()"
        />
      </div>
      @if (signals().length > 0) {
        <ul class="mt-4 flex flex-col gap-2">
          @for (s of signals(); track s.tipo + s.ejemplo) {
            <li
              class="flex items-start gap-3 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50"
            >
              <app-badge [tone]="severidadTone(s.severidad)">
                {{ s.severidad }}
              </app-badge>
              <div class="flex-1">
                <p class="font-medium leading-tight">{{ s.tipo }}</p>
                <p
                  class="mt-0.5 text-sm leading-snug text-zinc-600 dark:text-zinc-400"
                >
                  «{{ s.ejemplo }}»
                </p>
              </div>
            </li>
          }
        </ul>
      } @else {
        <p class="mt-3 text-sm italic text-zinc-500">
          No se detectaron señales de manipulación.
        </p>
      }
    </section>
  `,
})
export class LanguageAnalysisCmp {
  readonly analysis = input.required<LanguageAnalysis>();

  // Alias ASCII porque el lexer de templates de Angular no acepta `ñ` en identificadores.
  protected readonly signals = computed(() => this.analysis().señales);

  protected readonly toneLabel = computed(
    () =>
      ({
        neutral: 'Neutral',
        sensacionalista: 'Sensacionalista',
        propagandistico: 'Propagandístico',
        opinativo: 'Opinativo',
      })[this.analysis().tono],
  );

  protected readonly toneTone = computed<BadgeTone>(
    () =>
      ({
        neutral: 'success' as const,
        opinativo: 'neutral' as const,
        sensacionalista: 'warning' as const,
        propagandistico: 'danger' as const,
      })[this.analysis().tono],
  );

  protected readonly manipulacionTone = computed<ProgressTone>(() => {
    const s = this.analysis().puntuacion_manipulacion;
    if (s < 3) return 'success';
    if (s < 7) return 'warning';
    return 'danger';
  });

  protected severidadTone(sev: Severity): BadgeTone {
    return ({ baja: 'neutral', media: 'warning', alta: 'danger' } as const)[
      sev
    ];
  }
}
