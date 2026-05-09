import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="relative overflow-hidden rounded-2xl bg-zinc-200/60 dark:bg-zinc-800/60"
      [style.height]="height()"
      [style.width]="width()"
    >
      <div class="absolute inset-0 animate-shimmer"></div>
    </div>
  `,
})
export class Skeleton {
  readonly height = input<string>('1rem');
  readonly width = input<string>('100%');
}
