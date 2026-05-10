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
    <ul class="flex flex-col gap-3">
      @for (c of claims(); track c.text; let i = $index) {
        <li
          class="group rounded-2xl border border-zinc-200/80 bg-white/90 shadow-sm shadow-black/[0.02] backdrop-blur transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:hover:border-zinc-700"
        >
          <button
            type="button"
            (click)="toggle(i)"
            [attr.aria-expanded]="isOpen(i)"
            [attr.aria-controls]="'claim-panel-' + i"
            class="flex w-full items-start gap-3 px-4 py-3.5 text-left"
          >
            <span
              [class]="statusBadge(c.status)"
              class="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-2 ring-white/60 dark:ring-black/30"
              [attr.aria-label]="i18n.t(statusLabelKey(c.status))"
            >
              {{ statusIcon(c.status) }}
            </span>
            <span class="min-w-0 flex-1 break-words font-medium leading-snug">{{ c.text }}</span>
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
              class="animate-fade-in-up border-t border-zinc-200/70 px-4 py-3.5 dark:border-zinc-800/70"
            >
              @if (c.reason) {
                <p
                  class="mb-3 break-words text-sm leading-relaxed text-zinc-700 dark:text-zinc-300"
                >
                  <span class="font-semibold">{{ i18n.t('claims.reasonLabel') }}</span>
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

  protected statusIcon(s?: ClaimStatus): string {
    return { confirmed: '✓', refuted: '✗', unverified: '?' }[
      s ?? 'unverified'
    ];
  }

  protected statusLabelKey(s?: ClaimStatus): string {
    return `claims.status.${s ?? 'unverified'}`;
  }

  protected statusBadge(s?: ClaimStatus): string {
    return {
      confirmed:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200',
      refuted:
        'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-200',
      unverified:
        'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
    }[s ?? 'unverified'];
  }
}
