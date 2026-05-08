import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

@Component({
  selector: 'app-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span
    [class]="cls()"
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide"
    ><ng-content
  /></span>`,
})
export class Badge {
  readonly tone = input<BadgeTone>('neutral');

  protected readonly cls = computed(
    () =>
      ({
        neutral:
          'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200',
        success:
          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200',
        warning:
          'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
        danger:
          'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200',
        info: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
      })[this.tone()],
  );
}
