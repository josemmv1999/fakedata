import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import type { StepId } from '../../../../models/verification.types';
import type { StepState } from '../../../../core/stores/verification.store';

interface StepItem {
  id: StepId;
  state: StepState;
}

@Component({
  selector: 'app-progress-steps',
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ol
      aria-live="polite"
      aria-atomic="false"
      class="flex flex-col gap-2"
    >
      @for (step of steps(); track step.id) {
        <li
          [attr.aria-current]="step.state === 'active' ? 'step' : null"
          [class]="rowClass(step.state)"
          class="flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-300"
        >
          <span [class]="iconBg(step.state)" class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
            @switch (step.state) {
              @case ('done') {
                <i-lucide name="check" [size]="16" />
              }
              @case ('error') {
                <i-lucide name="x" [size]="16" />
              }
              @case ('active') {
                <span class="h-2.5 w-2.5 animate-ping rounded-full bg-current"></span>
              }
              @default {
                <i-lucide [name]="iconName(step.id)" [size]="16" />
              }
            }
          </span>
          <span class="font-medium leading-tight">{{ label(step.id) }}</span>
          @if (step.state === 'active' && currentMessage()) {
            <span class="ml-auto hidden truncate text-sm text-zinc-600 sm:inline-block sm:max-w-[55%] dark:text-zinc-400">
              {{ currentMessage() }}
            </span>
          }
        </li>
      }
    </ol>
  `,
})
export class ProgressSteps {
  readonly steps = input.required<StepItem[]>();
  readonly currentMessage = input<string>('');

  protected iconName(id: StepId): string {
    return {
      extract: 'file-search',
      claims: 'list-checks',
      search: 'search',
      language: 'languages',
      verdict: 'scale',
    }[id];
  }

  protected label(id: StepId): string {
    return {
      extract: 'Extraer contenido',
      claims: 'Identificar afirmaciones',
      search: 'Buscar evidencia',
      language: 'Analizar lenguaje',
      verdict: 'Emitir veredicto',
    }[id];
  }

  protected iconBg(state: StepState): string {
    return {
      pending: 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500',
      active: 'bg-blue-600 text-white',
      done: 'bg-emerald-600 text-white',
      error: 'bg-rose-600 text-white',
    }[state];
  }

  protected rowClass(state: StepState): string {
    return {
      pending:
        'border-zinc-200 bg-white text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400',
      active:
        'border-blue-300 bg-blue-50 text-blue-950 shadow-sm dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-100',
      done: 'border-emerald-200 bg-white text-zinc-700 dark:border-emerald-900 dark:bg-zinc-900 dark:text-zinc-200',
      error:
        'border-rose-300 bg-rose-50 text-rose-950 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-100',
    }[state];
  }
}
