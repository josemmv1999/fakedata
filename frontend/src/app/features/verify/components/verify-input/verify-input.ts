import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-verify-input',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form
      (submit)="$event.preventDefault(); onSubmit()"
      class="flex flex-col gap-3"
    >
      <label
        for="verify-input"
        class="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >URL o titular a verificar</label
      >
      <textarea
        id="verify-input"
        name="input"
        [(ngModel)]="value"
        [disabled]="disabled()"
        rows="3"
        autocomplete="off"
        spellcheck="false"
        placeholder="https://… o pega un titular (mín. 10 caracteres)"
        class="w-full resize-y rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
      ></textarea>
      <button
        type="submit"
        [disabled]="!canSubmit() || disabled()"
        class="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:disabled:bg-zinc-700"
      >
        {{ disabled() ? 'Verificando…' : 'Verificar' }}
      </button>
    </form>
  `,
})
export class VerifyInput {
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
