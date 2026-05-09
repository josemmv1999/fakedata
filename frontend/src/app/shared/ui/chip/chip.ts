import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      [href]="url()"
      target="_blank"
      rel="noopener noreferrer"
      [attr.title]="tooltip()"
      class="group inline-flex max-w-full items-center gap-2 rounded-full border border-zinc-200/80 bg-white/80 px-2.5 py-1 text-xs font-medium text-zinc-700 shadow-sm shadow-black/[0.02] backdrop-blur transition hover:-translate-y-px hover:border-zinc-300 hover:bg-white hover:shadow-md dark:border-zinc-700/70 dark:bg-zinc-800/70 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
    >
      <img
        [src]="favicon()"
        alt=""
        width="14"
        height="14"
        loading="lazy"
        class="h-3.5 w-3.5 shrink-0 rounded-sm"
        onerror="this.style.display='none'"
      />
      <span class="truncate">{{ domain() }}</span>
      <span
        aria-hidden="true"
        class="text-zinc-400 transition-transform group-hover:translate-x-0.5"
        >↗</span
      >
    </a>
  `,
})
export class Chip {
  readonly url = input.required<string>();
  readonly domain = input.required<string>();
  readonly title = input<string>('');
  readonly snippet = input<string>('');

  protected readonly favicon = computed(
    () =>
      `https://www.google.com/s2/favicons?domain=${encodeURIComponent(this.domain())}&sz=32`,
  );

  protected tooltip(): string {
    const t = this.title();
    const s = this.snippet();
    if (t && s) return `${t}\n\n${s}`;
    return t || s || this.url();
  }
}
