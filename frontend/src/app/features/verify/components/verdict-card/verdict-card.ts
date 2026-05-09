import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';

import { I18nService } from '../../../../core/i18n/i18n.service';
import type {
  CachedPayload,
  Verdict,
} from '../../../../models/verification.types';

const RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const MIN = 60;
const HOUR = 3600;
const DAY = 86400;

@Component({
  selector: 'app-verdict-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      [class]="cardClass()"
      class="relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm shadow-black/[0.03] transition-colors sm:p-7 lg:p-8 dark:bg-zinc-950 dark:shadow-black/30"
    >
      <!-- Top accent rule (only color statement) -->
      <div
        aria-hidden="true"
        [class]="accentClass()"
        class="absolute inset-x-0 top-0 h-1"
      ></div>

      <header class="flex items-start justify-between gap-4">
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span
              [class]="kickerClass()"
              class="text-[0.7rem] font-semibold uppercase tracking-[0.18em]"
            >
              {{ i18n.t('verdict.label.' + verdict().verdict) }}
            </span>
            @if (cached(); as c) {
              <span
                [attr.title]="i18n.t('cache.tooltip')"
                class="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
              >
                <span aria-hidden="true">⚡</span>
                {{ cachedLabel() }}
              </span>
            }
          </div>
          <h2
            class="mt-3 font-display text-3xl font-medium leading-[1.1] tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50"
          >
            {{ verdictLabel() }}
          </h2>
        </div>

        <!-- Confidence ring -->
        <div
          class="relative h-20 w-20 shrink-0 sm:h-24 sm:w-24"
          [attr.role]="'img'"
          [attr.aria-label]="
            i18n.t('verdict.confidence') + ': ' + verdict().confidence + '/100'
          "
        >
          <svg viewBox="0 0 88 88" class="h-full w-full -rotate-90">
            <circle
              cx="44"
              cy="44"
              [attr.r]="radius"
              stroke-width="6"
              fill="none"
              class="stroke-zinc-200 dark:stroke-zinc-800"
            />
            <circle
              cx="44"
              cy="44"
              [attr.r]="radius"
              stroke-width="6"
              fill="none"
              [attr.stroke-dasharray]="circumference"
              [attr.stroke-dashoffset]="dashoffset()"
              stroke-linecap="round"
              [class]="ringStroke()"
              class="transition-all duration-700 ease-out"
            />
          </svg>
          <div
            class="absolute inset-0 flex flex-col items-center justify-center"
          >
            <span
              class="font-display text-2xl font-medium tabular-nums leading-none text-zinc-900 sm:text-3xl dark:text-zinc-50"
              >{{ verdict().confidence }}</span
            >
            <span
              class="mt-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-500"
              >{{ i18n.t('verdict.confidence') }}</span
            >
          </div>
        </div>
      </header>

      <p
        class="mt-7 break-words font-display text-[1.125rem] leading-[1.6] text-zinc-800 first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-[3.5rem] first-letter:font-medium first-letter:leading-[0.95] first-letter:text-zinc-900 sm:text-[1.1875rem] dark:text-zinc-200 dark:first-letter:text-zinc-50"
      >
        {{ verdict().summary }}
      </p>

      @if (verdict().red_flags.length > 0) {
        <section
          class="mt-7 border-t border-zinc-200 pt-5 dark:border-zinc-800"
        >
          <h3
            class="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400"
          >
            {{ i18n.t('verdict.redFlags') }}
          </h3>
          <ul class="mt-3 space-y-2 text-[0.9375rem] leading-relaxed">
            @for (b of verdict().red_flags; track b) {
              <li class="flex items-start gap-3">
                <span
                  [class]="accentClass()"
                  class="mt-2 h-1 w-2 shrink-0"
                ></span>
                <span
                  class="min-w-0 flex-1 break-words text-zinc-700 dark:text-zinc-300"
                  >{{ b }}</span
                >
              </li>
            }
          </ul>
        </section>
      }

      <section class="mt-7 border-t border-zinc-200 pt-5 dark:border-zinc-800">
        <h3
          class="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400"
        >
          {{ i18n.t('verdict.recommendation') }}
        </h3>
        <p
          class="mt-2 break-words font-display text-[0.9375rem] italic leading-relaxed text-zinc-700 sm:text-base dark:text-zinc-300"
        >
          {{ verdict().recommendation }}
        </p>
      </section>
    </article>
  `,
})
export class VerdictCard {
  protected readonly i18n = inject(I18nService);

  readonly verdict = input.required<Verdict>();
  readonly cached = input<CachedPayload | null>(null);

  protected readonly radius = RADIUS;
  protected readonly circumference = CIRCUMFERENCE;

  protected readonly verdictLabel = computed(() =>
    this.i18n.t(`verdict.label.${this.verdict().verdict}`),
  );

  protected readonly cachedLabel = computed(() => {
    const c = this.cached();
    if (!c) return '';
    const a = Math.max(0, c.age_seconds);
    if (a < MIN) return this.i18n.t('cache.justNow');
    if (a < HOUR) return this.i18n.t('cache.minutesAgo').replace('{n}', String(Math.floor(a / MIN)));
    if (a < DAY) return this.i18n.t('cache.hoursAgo').replace('{n}', String(Math.floor(a / HOUR)));
    return this.i18n.t('cache.daysAgo').replace('{n}', String(Math.floor(a / DAY)));
  });

  protected readonly dashoffset = computed(() => {
    const pct = Math.max(0, Math.min(100, this.verdict().confidence));
    return CIRCUMFERENCE * (1 - pct / 100);
  });

  protected readonly cardClass = computed(
    () =>
      ({
        true: 'border-zinc-200 dark:border-zinc-800',
        false: 'border-zinc-200 dark:border-zinc-800',
        partially_true: 'border-zinc-200 dark:border-zinc-800',
        unverified: 'border-zinc-200 dark:border-zinc-800',
      })[this.verdict().verdict],
  );

  protected readonly accentClass = computed(
    () =>
      ({
        true: 'bg-emerald-600 dark:bg-emerald-500',
        false: 'bg-rose-600 dark:bg-rose-500',
        partially_true: 'bg-amber-600 dark:bg-amber-500',
        unverified: 'bg-zinc-500 dark:bg-zinc-600',
      })[this.verdict().verdict],
  );

  protected readonly kickerClass = computed(
    () =>
      ({
        true: 'text-emerald-700 dark:text-emerald-400',
        false: 'text-rose-700 dark:text-rose-400',
        partially_true: 'text-amber-700 dark:text-amber-400',
        unverified: 'text-zinc-600 dark:text-zinc-400',
      })[this.verdict().verdict],
  );

  protected readonly ringStroke = computed(
    () =>
      ({
        true: 'stroke-emerald-600 dark:stroke-emerald-500',
        false: 'stroke-rose-600 dark:stroke-rose-500',
        partially_true: 'stroke-amber-600 dark:stroke-amber-500',
        unverified: 'stroke-zinc-500 dark:stroke-zinc-600',
      })[this.verdict().verdict],
  );
}
