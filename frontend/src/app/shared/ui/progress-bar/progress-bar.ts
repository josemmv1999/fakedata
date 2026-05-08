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
      class="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
    >
      <div
        [class]="fill()"
        class="h-full rounded-full transition-all duration-500 ease-out"
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
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        danger: 'bg-rose-500',
        neutral: 'bg-zinc-500',
        info: 'bg-blue-500',
      })[this.tone()],
  );
}
