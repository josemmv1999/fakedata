import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { I18nService } from '../../../core/i18n/i18n.service';
import { BrandMark } from '../brand-mark/brand-mark';

const PRODUCT_NAME = 'Veritas';
const GITHUB_URL = 'https://github.com';
const CONTACT_EMAIL = 'hello@example.com';

@Component({
  selector: 'app-site-footer',
  imports: [BrandMark, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer
      class="mt-16 border-t border-zinc-200/70 bg-white/40 backdrop-blur-sm sm:mt-24 dark:border-zinc-800/70 dark:bg-zinc-950/40"
    >
      <div
        class="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8"
      >
        <div
          class="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between"
        >
          <div class="max-w-sm">
            <app-brand-mark [name]="productName" size="md" />
            <p
              class="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400"
            >
              {{ i18n.t('footer.tagline') }}
            </p>
          </div>

          <nav
            class="grid grid-cols-2 gap-x-10 gap-y-6 text-sm sm:grid-cols-3"
            [attr.aria-label]="i18n.t('footer.navLabel')"
          >
            <div>
              <h3
                class="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400"
              >
                {{ i18n.t('footer.product') }}
              </h3>
              <ul class="mt-3 space-y-2">
                <li>
                  <a
                    href="#top"
                    class="text-zinc-700 transition-colors hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                    >{{ i18n.t('footer.tryIt') }}</a
                  >
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    class="text-zinc-700 transition-colors hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                    >{{ i18n.t('footer.howItWorks') }}</a
                  >
                </li>
              </ul>
            </div>

            <div>
              <h3
                class="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400"
              >
                {{ i18n.t('footer.legal') }}
              </h3>
              <ul class="mt-3 space-y-2">
                <li>
                  <a
                    href="#"
                    class="text-zinc-700 transition-colors hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                    >{{ i18n.t('footer.privacy') }}</a
                  >
                </li>
                <li>
                  <a
                    href="#"
                    class="text-zinc-700 transition-colors hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                    >{{ i18n.t('footer.terms') }}</a
                  >
                </li>
              </ul>
            </div>

            <div>
              <h3
                class="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400"
              >
                {{ i18n.t('footer.connect') }}
              </h3>
              <ul class="mt-3 space-y-2">
                <li>
                  <a
                    [attr.href]="'mailto:' + contactEmail"
                    class="text-zinc-700 transition-colors hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                    >{{ i18n.t('footer.contact') }}</a
                  >
                </li>
                <li>
                  <a
                    [attr.href]="githubUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1.5 text-zinc-700 transition-colors hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                  >
                    <i-lucide name="github" class="h-3.5 w-3.5"></i-lucide>
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div
          class="mt-10 border-t border-zinc-200/60 pt-6 dark:border-zinc-800/60"
        >
          <div
            class="flex flex-col-reverse gap-3 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between dark:text-zinc-500"
          >
            <p>
              &copy; {{ year }} {{ productName }}.
              {{ i18n.t('footer.rightsReserved') }}
            </p>
            <p
              class="inline-flex items-center gap-1.5 leading-relaxed sm:max-w-md sm:text-right"
            >
              <i-lucide
                name="info"
                class="h-3.5 w-3.5 shrink-0 opacity-70"
                aria-hidden="true"
              ></i-lucide>
              <span>{{ i18n.t('footer.disclaimer') }}</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class SiteFooter {
  protected readonly i18n = inject(I18nService);

  protected readonly productName = PRODUCT_NAME;
  protected readonly githubUrl = GITHUB_URL;
  protected readonly contactEmail = CONTACT_EMAIL;
  protected readonly year = new Date().getFullYear();
}
