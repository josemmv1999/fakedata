import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';

import { I18nService } from '../../../../core/i18n/i18n.service';
import type { Verdict } from '../../../../models/verification.types';

const RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

@Component({
  selector: 'app-verdict-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      [class]="cardClass()"
      class="relative overflow-hidden rounded-3xl border-2 p-5 shadow-xl shadow-black/[0.04] backdrop-blur-sm transition-colors sm:p-7 lg:p-8 dark:shadow-black/40"
    >
      <!-- Decorative glow -->
      <div
        aria-hidden="true"
        [class]="glowClass()"
        class="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full opacity-50 blur-3xl"
      ></div>

      <header class="relative flex items-start justify-between gap-4">
        <div class="flex items-center gap-3">
          <span
            [class]="badgeClass()"
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold ring-4 ring-white/40 dark:ring-black/30"
          >
            {{ icon() }}
          </span>
          <div class="min-w-0">
            <p
              class="text-[0.65rem] font-medium uppercase tracking-[0.16em] opacity-70"
            >
              {{ i18n.t('verdict.label.' + verdict().verdict) }}
            </p>
            <h2
              class="font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl"
            >
              {{ verdictLabel() }}
            </h2>
          </div>
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
              stroke-width="8"
              fill="none"
              class="stroke-current opacity-15"
            />
            <circle
              cx="44"
              cy="44"
              [attr.r]="radius"
              stroke-width="8"
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
              class="font-display text-2xl font-semibold tabular-nums leading-none sm:text-3xl"
              >{{ verdict().confidence }}</span
            >
            <span
              class="mt-0.5 text-[0.55rem] font-medium uppercase tracking-[0.16em] opacity-60"
              >{{ i18n.t('verdict.confidence') }}</span
            >
          </div>
        </div>
      </header>

      <p
        class="relative mt-6 text-base leading-relaxed sm:text-[1.0625rem]"
      >
        {{ verdict().summary }}
      </p>

      @if (verdict().red_flags.length > 0) {
        <section class="relative mt-6">
          <h3
            class="text-[0.7rem] font-semibold uppercase tracking-[0.16em] opacity-75"
          >
            {{ i18n.t('verdict.redFlags') }}
          </h3>
          <ul class="mt-2 space-y-1.5 text-sm leading-relaxed">
            @for (b of verdict().red_flags; track b) {
              <li class="flex items-start gap-2">
                <span
                  class="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-current opacity-70"
                ></span>
                <span>{{ b }}</span>
              </li>
            }
          </ul>
        </section>
      }

      <section
        class="relative mt-6 rounded-2xl bg-white/50 p-4 backdrop-blur dark:bg-black/20"
      >
        <h3
          class="text-[0.7rem] font-semibold uppercase tracking-[0.16em] opacity-75"
        >
          {{ i18n.t('verdict.recommendation') }}
        </h3>
        <p class="mt-1.5 text-sm leading-relaxed sm:text-[0.9375rem]">
          {{ verdict().recommendation }}
        </p>
      </section>
    </article>
  `,
})
export class VerdictCard {
  protected readonly i18n = inject(I18nService);

  readonly verdict = input.required<Verdict>();

  protected readonly radius = RADIUS;
  protected readonly circumference = CIRCUMFERENCE;

  protected readonly verdictLabel = computed(() =>
    this.i18n.t(`verdict.label.${this.verdict().verdict}`),
  );

  protected readonly dashoffset = computed(() => {
    const pct = Math.max(0, Math.min(100, this.verdict().confidence));
    return CIRCUMFERENCE * (1 - pct / 100);
  });

  protected readonly cardClass = computed(
    () =>
      ({
        true: 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 to-white text-emerald-950 dark:border-emerald-700/60 dark:from-emerald-950/60 dark:to-zinc-950 dark:text-emerald-50',
        false:
          'border-rose-300/70 bg-gradient-to-br from-rose-50 to-white text-rose-950 dark:border-rose-700/60 dark:from-rose-950/60 dark:to-zinc-950 dark:text-rose-50',
        partially_true:
          'border-amber-300/70 bg-gradient-to-br from-amber-50 to-white text-amber-950 dark:border-amber-700/60 dark:from-amber-950/60 dark:to-zinc-950 dark:text-amber-50',
        unverified:
          'border-zinc-300/80 bg-gradient-to-br from-zinc-50 to-white text-zinc-900 dark:border-zinc-700/70 dark:from-zinc-900 dark:to-zinc-950 dark:text-zinc-100',
      })[this.verdict().verdict],
  );

  protected readonly badgeClass = computed(
    () =>
      ({
        true: 'bg-emerald-500 text-white',
        false: 'bg-rose-500 text-white',
        partially_true: 'bg-amber-500 text-white',
        unverified: 'bg-zinc-500 text-white',
      })[this.verdict().verdict],
  );

  protected readonly glowClass = computed(
    () =>
      ({
        true: 'bg-emerald-400/40 dark:bg-emerald-500/30',
        false: 'bg-rose-400/40 dark:bg-rose-500/30',
        partially_true: 'bg-amber-400/40 dark:bg-amber-500/30',
        unverified: 'bg-zinc-400/30 dark:bg-zinc-500/20',
      })[this.verdict().verdict],
  );

  protected readonly ringStroke = computed(
    () =>
      ({
        true: 'text-emerald-500 drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]',
        false: 'text-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.5)]',
        partially_true:
          'text-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]',
        unverified: 'text-zinc-500',
      })[this.verdict().verdict],
  );

  protected readonly icon = computed(
    () =>
      ({
        true: '✓',
        false: '✕',
        partially_true: '≈',
        unverified: '?',
      })[this.verdict().verdict],
  );
}
