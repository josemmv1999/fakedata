import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { I18nService } from '../../../../core/i18n/i18n.service';
import type {
  ClaimStatus,
  Source,
} from '../../../../models/verification.types';
import { Chip } from '../../../../shared/ui';

export interface ClaimRow {
  text: string;
  keywords: string;
  sources: Source[];
  status?: ClaimStatus;
  reason?: string;
}

@Component({
  selector: 'app-claims-list',
  imports: [Chip, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul
      class="divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
    >
      @for (c of claims(); track c.text; let i = $index) {
        <li class="group">
          <button
            type="button"
            (click)="toggle(i)"
            [attr.aria-expanded]="isOpen(i)"
            [attr.aria-controls]="'claim-panel-' + i"
            class="flex w-full items-start gap-4 px-5 py-5 text-left transition-colors hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40"
          >
            <span
              [class]="statusBullet(c.status)"
              class="mt-2 h-1.5 w-6 shrink-0"
              [attr.aria-label]="i18n.t(statusLabelKey(c.status))"
            ></span>
            <span
              class="min-w-0 flex-1 break-words font-display text-[1.0625rem] font-medium leading-snug text-zinc-900 dark:text-zinc-50"
              >{{ c.text }}</span
            >
            <span
              [class]="statusKicker(c.status)"
              class="hidden shrink-0 text-[0.65rem] font-semibold uppercase tracking-[0.16em] sm:inline-block"
              >{{ i18n.t(statusLabelKey(c.status)) }}</span
            >
            <i-lucide
              name="chevron-down"
              [size]="18"
              class="mt-1 shrink-0 text-zinc-400 transition-transform duration-300"
              [class.rotate-180]="isOpen(i)"
            />
          </button>
          @if (isOpen(i)) {
            <div
              [id]="'claim-panel-' + i"
              class="animate-fade-in-up border-t border-zinc-200/70 bg-zinc-50/40 px-5 py-4 pl-[2.875rem] dark:border-zinc-800/70 dark:bg-zinc-900/30"
            >
              @if (c.reason) {
                <p
                  class="mb-3 break-words font-display text-[0.9375rem] italic leading-relaxed text-zinc-700 dark:text-zinc-300"
                >
                  <span class="font-semibold not-italic">{{ i18n.t('claims.reasonLabel') }}</span>
                  {{ c.reason }}
                </p>
              }
              @if (c.sources.length === 0) {
                <p class="text-sm italic text-zinc-500">
                  {{ i18n.t('claims.noSources') }}
                </p>
              } @else {
                <ul class="flex flex-wrap gap-2">
                  @for (s of c.sources; track s.url) {
                    <li>
                      <app-chip
                        [domain]="s.domain"
                        [url]="s.url"
                        [title]="s.title"
                        [snippet]="s.snippet"
                      />
                    </li>
                  }
                </ul>
              }
            </div>
          }
        </li>
      }
    </ul>
  `,
})
export class ClaimsList {
  protected readonly i18n = inject(I18nService);

  readonly claims = input.required<ClaimRow[]>();

  private readonly openSet = signal<ReadonlySet<number>>(new Set());

  protected isOpen(i: number): boolean {
    return this.openSet().has(i);
  }

  protected toggle(i: number) {
    const s = new Set(this.openSet());
    if (s.has(i)) s.delete(i);
    else s.add(i);
    this.openSet.set(s);
  }

  protected statusLabelKey(s?: ClaimStatus): string {
    return `claims.status.${s ?? 'unverified'}`;
  }

  protected statusBullet(s?: ClaimStatus): string {
    return {
      confirmed: 'bg-emerald-600 dark:bg-emerald-500',
      refuted: 'bg-rose-600 dark:bg-rose-500',
      unverified: 'bg-zinc-400 dark:bg-zinc-600',
    }[s ?? 'unverified'];
  }

  protected statusKicker(s?: ClaimStatus): string {
    return {
      confirmed: 'text-emerald-700 dark:text-emerald-400',
      refuted: 'text-rose-700 dark:text-rose-400',
      unverified: 'text-zinc-500 dark:text-zinc-500',
    }[s ?? 'unverified'];
  }
}
