import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { I18nService } from '../../../core/i18n/i18n.service';
import type { Locale } from '../../../models/verification.types';

@Component({
  selector: 'app-locale-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="relative flex items-center text-sm">
      <span class="sr-only">{{ i18n.t('locale.label') }}</span>
      <select
        (change)="onChange($event)"
        [attr.aria-label]="i18n.t('locale.label')"
        class="appearance-none rounded-full border border-zinc-200/80 bg-white/70 py-2 pl-9 pr-8 text-sm font-medium text-zinc-700 backdrop-blur transition hover:border-zinc-300 hover:bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 dark:border-zinc-700/80 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-900"
      >
        @for (l of i18n.supportedLocales; track l) {
          <option [value]="l" [selected]="l === i18n.locale()">
            {{ i18n.t('locale.' + l) }}
          </option>
        }
      </select>
      <span
        aria-hidden="true"
        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base"
        >🌐</span
      >
      <span
        aria-hidden="true"
        class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400"
        >▾</span
      >
    </label>
  `,
})
export class LocaleSwitcher {
  protected readonly i18n = inject(I18nService);

  protected onChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value as Locale;
    this.i18n.setLocale(value);
  }
}
