import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { I18nService } from '../../../../core/i18n/i18n.service';

@Component({
  selector: 'app-empty-state',
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-6">
      <section
        class="rounded-2xl border border-zinc-200/80 bg-white/70 p-6 shadow-sm shadow-black/[0.02] backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:shadow-black/30"
      >
        <h2 class="font-display text-xl font-semibold tracking-tight">
          {{ i18n.t('empty.howItWorks') }}
        </h2>
        <ol class="mt-5 flex flex-col gap-4">
          @for (n of stepNumbers; track n) {
            <li class="flex items-start gap-3">
              <span
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 font-display text-sm font-semibold text-blue-700 dark:bg-blue-950/70 dark:text-blue-200"
                aria-hidden="true"
                >{{ n }}</span
              >
              <span class="pt-1 leading-snug text-zinc-700 dark:text-zinc-300">
                {{ i18n.t('empty.step' + n) }}
              </span>
            </li>
          }
        </ol>
      </section>

      <section>
        <h3
          class="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400"
        >
          {{ i18n.t('empty.tryOne') }}
        </h3>
        <ul class="flex flex-col gap-2">
          @for (n of stepNumbers; track n) {
            <li>
              <button
                type="button"
                (click)="onPick(i18n.t('empty.item' + n))"
                class="group flex w-full items-start gap-3 rounded-xl border border-zinc-200/80 bg-white/60 p-3.5 text-left text-[0.9375rem] leading-snug text-zinc-700 backdrop-blur transition hover:-translate-y-px hover:border-zinc-300 hover:bg-white hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:text-zinc-200 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
              >
                <i-lucide
                  name="search"
                  [size]="16"
                  class="mt-0.5 shrink-0 text-zinc-400 transition-colors group-hover:text-blue-500"
                />
                <span class="flex-1">{{ i18n.t('empty.item' + n) }}</span>
                <span
                  aria-hidden="true"
                  class="mt-0.5 shrink-0 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500 dark:text-zinc-600"
                  >→</span
                >
              </button>
            </li>
          }
        </ul>
      </section>
    </div>
  `,
})
export class EmptyState {
  protected readonly i18n = inject(I18nService);

  readonly pick = output<string>();

  protected readonly stepNumbers = [1, 2, 3] as const;

  protected onPick(text: string) {
    this.pick.emit(text);
  }
}
