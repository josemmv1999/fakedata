import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ProgressTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

@Component({
  selector: 'app-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      role="progressbar"
      [attr.aria-valuenow]="clamped()"
      aria-valuemin="0"
      aria-valuemax="100"
      class="h-2.5 w-full overflow-hidden rounded-full bg-zinc-200/80 dark:bg-zinc-800/80"
    >
      <div
        [class]="fill()"
        class="h-full rounded-full transition-all duration-700 ease-out"
        [style.width.%]="clamped()"
      ></div>
    </div>
  `,
})
export class ProgressBar {
  readonly value = input.required<number>();
  readonly tone = input<ProgressTone>('info');

  protected readonly clamped = computed(() =>
    Math.max(0, Math.min(100, this.value())),
  );

  protected readonly fill = computed(
    () =>
      ({
        success: 'bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.45)]',
        warning: 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]',
        danger: 'bg-gradient-to-r from-rose-400 to-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]',
        neutral: 'bg-gradient-to-r from-zinc-400 to-zinc-500',
        info: 'bg-gradient-to-r from-blue-400 to-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.4)]',
      })[this.tone()],
  );
}
