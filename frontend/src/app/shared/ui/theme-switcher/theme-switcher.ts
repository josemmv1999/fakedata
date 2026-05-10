import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { I18nService } from '../../../core/i18n/i18n.service';
import { ThemeService, type ThemeMode } from '../../../core/theme/theme.service';

@Component({
  selector: 'app-theme-switcher',
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      (click)="theme.cycle()"
      [attr.aria-label]="ariaLabel()"
      [attr.title]="ariaLabel()"
      class="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200/80 bg-white/90 text-zinc-700 backdrop-blur transition hover:-translate-y-px hover:border-zinc-300 hover:bg-white hover:shadow-md focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 dark:border-zinc-700/80 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-900"
    >
      <i-lucide [name]="iconName()" [size]="18" aria-hidden="true" />
    </button>
  `,
})
export class ThemeSwitcher {
  protected readonly theme = inject(ThemeService);
  protected readonly i18n = inject(I18nService);

  protected readonly iconName = computed<string>(() => {
    const map: Record<ThemeMode, string> = {
      system: 'monitor',
      light: 'sun',
      dark: 'moon',
    };
    return map[this.theme.mode()];
  });

  protected readonly ariaLabel = computed(() =>
    this.i18n.t(`theme.${this.theme.mode()}`),
  );
}
