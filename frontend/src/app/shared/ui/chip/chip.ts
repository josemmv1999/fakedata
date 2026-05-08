import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      [href]="url()"
      target="_blank"
      rel="noopener noreferrer"
      [attr.title]="tooltip()"
      class="inline-flex max-w-full items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
    >
      <span class="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
      <span class="truncate">{{ domain() }}</span>
    </a>
  `,
})
export class Chip {
  readonly url = input.required<string>();
  readonly domain = input.required<string>();
  readonly title = input<string>('');
  readonly snippet = input<string>('');

  protected tooltip(): string {
    const t = this.title();
    const s = this.snippet();
    if (t && s) return `${t}\n\n${s}`;
    return t || s || this.url();
  }
}
