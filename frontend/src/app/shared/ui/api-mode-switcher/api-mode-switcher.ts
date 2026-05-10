import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { ApiModeService } from '../../../core/api/api-mode.service';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-api-mode-switcher',
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      (click)="apiMode.toggle()"
      [attr.aria-label]="ariaLabel()"
      [attr.title]="ariaLabel()"
      [class]="buttonClass()"
      class="relative flex h-10 items-center gap-2 rounded-full border px-3 text-xs font-semibold uppercase tracking-[0.14em] backdrop-blur transition hover:-translate-y-px hover:shadow-md focus:outline-none focus:ring-4"
    >
      <i-lucide [name]="iconName()" [size]="14" aria-hidden="true" />
      <span>{{ label() }}</span>
      @if (apiMode.mode() === 'mock') {
        <span
          aria-hidden="true"
          class="ml-0.5 h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_0_2px_rgba(245,158,11,0.25)]"
        ></span>
      }
    </button>
  `,
})
export class ApiModeSwitcher {
  protected readonly apiMode = inject(ApiModeService);
  protected readonly i18n = inject(I18nService);

  protected readonly iconName = computed(() =>
    this.apiMode.mode() === 'mock' ? 'flask-conical' : 'server',
  );

  protected readonly label = computed(() =>
    this.i18n.t(`apiMode.${this.apiMode.mode()}`),
  );

  protected readonly ariaLabel = computed(() =>
    this.i18n.t(`apiMode.toggle.${this.apiMode.mode()}`),
  );

  protected readonly buttonClass = computed(() =>
    this.apiMode.mode() === 'mock'
      ? 'border-amber-300/80 bg-amber-50/90 text-amber-800 hover:border-amber-400 hover:bg-amber-50 focus:border-amber-500 focus:ring-amber-500/30 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-950/60'
      : 'border-zinc-200/80 bg-white/90 text-zinc-700 hover:border-zinc-300 hover:bg-white focus:border-blue-500 focus:ring-blue-500/20 dark:border-zinc-700/80 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-900',
  );
}
