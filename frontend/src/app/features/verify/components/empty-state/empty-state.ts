import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
} from '@angular/core';

import { I18nService } from '../../../../core/i18n/i18n.service';

@Component({
  selector: 'app-empty-state',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-10">
      <section
        class="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h2
          class="font-display text-xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          {{ i18n.t('empty.howItWorks') }}
        </h2>
        <ol
          class="mt-5 divide-y divide-zinc-200 dark:divide-zinc-800"
        >
          @for (n of stepNumbers; track n) {
            <li class="flex items-baseline gap-4 py-3 first:pt-0 last:pb-0">
              <span
                class="font-display text-sm font-medium tabular-nums text-emerald-700 dark:text-emerald-400"
                aria-hidden="true"
                >0{{ n }}.</span
              >
              <span
                class="leading-snug text-zinc-700 dark:text-zinc-300"
              >
                {{ i18n.t('empty.step' + n) }}
              </span>
            </li>
          }
        </ol>
      </section>

      <section>
        <h3
          class="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400"
        >
          {{ i18n.t('empty.tryOne') }}
        </h3>
        <ul class="divide-y divide-zinc-200 dark:divide-zinc-800">
          @for (n of stepNumbers; track n) {
            <li>
              <button
                type="button"
                (click)="onPick(i18n.t('empty.item' + n))"
                class="group flex w-full items-baseline gap-4 py-4 text-left transition-colors hover:text-zinc-950 dark:hover:text-zinc-50"
              >
                <span
                  aria-hidden="true"
                  class="font-display text-sm font-medium tabular-nums text-zinc-400 dark:text-zinc-600"
                  >0{{ n }}</span
                >
                <span
                  class="flex-1 break-words font-display text-lg italic leading-snug text-zinc-700 sm:text-xl dark:text-zinc-300"
                  >&ldquo;{{ i18n.t('empty.item' + n) }}&rdquo;</span
                >
                <span
                  aria-hidden="true"
                  class="self-center text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-600 dark:text-zinc-700 dark:group-hover:text-emerald-400"
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
