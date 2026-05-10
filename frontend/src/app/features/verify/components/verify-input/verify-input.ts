import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { I18nService } from '../../../../core/i18n/i18n.service';

@Component({
  selector: 'app-verify-input',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form
      (submit)="$event.preventDefault(); onSubmit()"
      class="flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-sm shadow-black/[0.02] backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:shadow-black/30"
    >
      <label
        for="verify-input"
        class="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400"
        >{{ i18n.t('input.label') }}</label
      >
      <textarea
        id="verify-input"
        name="input"
        [(ngModel)]="value"
        [disabled]="disabled()"
        rows="3"
        autocomplete="off"
        spellcheck="false"
        [placeholder]="i18n.t('input.placeholder')"
        class="w-full resize-y rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900 transition placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500"
      ></textarea>
      <button
        type="submit"
        [disabled]="!canSubmit() || disabled()"
        class="group inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 px-6 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:shadow-blue-500/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30 disabled:cursor-not-allowed disabled:from-zinc-300 disabled:to-zinc-300 disabled:shadow-none dark:disabled:from-zinc-800 dark:disabled:to-zinc-800"
      >
        <span class="relative">
          {{ disabled() ? i18n.t('input.submitBusy') : i18n.t('input.submit') }}
        </span>
        @if (!disabled()) {
          <span aria-hidden="true" class="transition-transform group-hover:translate-x-0.5">→</span>
        }
      </button>
    </form>
  `,
})
export class VerifyInput {
  protected readonly i18n = inject(I18nService);

  readonly disabled = input<boolean>(false);
  readonly verify = output<string>();

  protected readonly value = signal('');

  protected readonly canSubmit = computed(() => {
    const v = this.value().trim();
    if (!v) return false;
    if (v.startsWith('http://') || v.startsWith('https://')) return true;
    return v.length >= 10;
  });

  protected onSubmit() {
    if (!this.canSubmit() || this.disabled()) return;
    this.verify.emit(this.value().trim());
  }
}
