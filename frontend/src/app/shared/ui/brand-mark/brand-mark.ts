import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';

@Component({
  selector: 'app-brand-mark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      [attr.href]="href()"
      class="group inline-flex items-baseline gap-1.5 text-zinc-900 transition-opacity hover:opacity-80 dark:text-zinc-50"
      [attr.aria-label]="name()"
    >
      <span
        class="font-display font-semibold leading-none tracking-tight"
        [class]="sizeClass()"
      >
        {{ name() }}
      </span>
      <span
        aria-hidden="true"
        class="h-1.5 w-1.5 rounded-full bg-emerald-500 transition-transform group-hover:scale-110"
      ></span>
    </a>
  `,
})
export class BrandMark {
  readonly name = input<string>('Veritas');
  readonly href = input<string>('/');
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  protected sizeClass() {
    return {
      sm: 'text-lg',
      md: 'text-xl sm:text-2xl',
      lg: 'text-2xl sm:text-3xl',
    }[this.size()];
  }
}
