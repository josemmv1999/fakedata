import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800"
      [style.height]="height()"
      [style.width]="width()"
    ></div>
  `,
})
export class Skeleton {
  readonly height = input<string>('1rem');
  readonly width = input<string>('100%');
}
