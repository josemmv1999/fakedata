import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { I18nService } from '../../../../core/i18n/i18n.service';
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
      class="relative flex flex-col"
    >
      @for (step of steps(); track step.id; let last = $last) {
        <li class="relative flex gap-4 pb-5 last:pb-0">
          @if (!last) {
            <span
              aria-hidden="true"
              [class]="lineCls(step.state)"
              class="absolute left-4 top-9 -ml-px w-0.5 bottom-0 transition-colors duration-500"
            ></span>
          }
          <span
            [attr.aria-current]="step.state === 'active' ? 'step' : null"
            [class]="circleCls(step.state)"
            class="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-zinc-50 transition-colors dark:ring-zinc-950"
          >
            @switch (step.state) {
              @case ('done') {
                <i-lucide name="check" [size]="14" />
              }
              @case ('error') {
                <i-lucide name="x" [size]="14" />
              }
              @case ('active') {
                <span
                  class="h-2 w-2 rounded-full bg-current"
                ></span>
              }
              @default {
                <i-lucide [name]="iconName(step.id)" [size]="14" />
              }
            }
          </span>
          <div class="flex-1 pt-1.5">
            <p
              [class]="labelCls(step.state)"
              class="font-medium leading-tight transition-colors"
            >
              {{ label(step.id) }}
            </p>
            @if (step.state === 'active' && currentMessage()) {
              <p
                class="mt-1 truncate text-sm leading-snug text-zinc-500 dark:text-zinc-400"
              >
                {{ currentMessage() }}
              </p>
            }
          </div>
        </li>
      }
    </ol>
  `,
})
export class ProgressSteps {
  protected readonly i18n = inject(I18nService);

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
    return this.i18n.t(`step.${id}`);
  }

  protected circleCls(state: StepState): string {
    return {
      pending:
        'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500',
      active: 'bg-blue-600 text-white animate-pulse-glow',
      done: 'bg-emerald-500 text-white',
      error: 'bg-rose-500 text-white',
    }[state];
  }

  protected lineCls(state: StepState): string {
    return {
      pending: 'bg-zinc-200 dark:bg-zinc-800',
      active: 'bg-zinc-200 dark:bg-zinc-800',
      done: 'bg-emerald-500/60',
      error: 'bg-rose-500/60',
    }[state];
  }

  protected labelCls(state: StepState): string {
    return {
      pending: 'text-zinc-500 dark:text-zinc-500',
      active: 'text-blue-700 dark:text-blue-300',
      done: 'text-zinc-900 dark:text-zinc-100',
      error: 'text-rose-700 dark:text-rose-300',
    }[state];
  }
}
