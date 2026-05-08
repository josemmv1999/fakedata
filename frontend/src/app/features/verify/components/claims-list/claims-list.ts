import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import type {
  ClaimStatus,
  Source,
} from '../../../../models/verification.types';
import { Chip } from '../../../../shared/ui';

export interface ClaimRow {
  text: string;
  keywords: string;
  sources: Source[];
  estado?: ClaimStatus;
  razon?: string;
}

@Component({
  selector: 'app-claims-list',
  imports: [Chip, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="flex flex-col gap-3">
      @for (c of claims(); track c.text; let i = $index) {
        <li
          class="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <button
            type="button"
            (click)="toggle(i)"
            [attr.aria-expanded]="isOpen(i)"
            [attr.aria-controls]="'claim-panel-' + i"
            class="flex w-full items-start gap-3 px-4 py-3 text-left"
          >
            <span
              [class]="estadoBadge(c.estado)"
              class="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
              [attr.aria-label]="estadoLabel(c.estado)"
            >
              {{ estadoIcon(c.estado) }}
            </span>
            <span class="flex-1 font-medium leading-snug">{{ c.text }}</span>
            <i-lucide
              [name]="isOpen(i) ? 'chevron-up' : 'chevron-down'"
              [size]="18"
              class="mt-1 text-zinc-500"
            />
          </button>
          @if (isOpen(i)) {
            <div
              [id]="'claim-panel-' + i"
              class="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800"
            >
              @if (c.razon) {
                <p
                  class="mb-3 text-sm text-zinc-700 dark:text-zinc-300"
                >
                  <span class="font-semibold">Razón:</span> {{ c.razon }}
                </p>
              }
              @if (c.sources.length === 0) {
                <p class="text-sm italic text-zinc-500">
                  Sin fuentes encontradas.
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

  protected estadoIcon(e?: ClaimStatus): string {
    return { confirmada: '✓', refutada: '✗', sin_evidencia: '?' }[
      e ?? 'sin_evidencia'
    ];
  }

  protected estadoLabel(e?: ClaimStatus): string {
    return {
      confirmada: 'Confirmada',
      refutada: 'Refutada',
      sin_evidencia: 'Sin evidencia',
    }[e ?? 'sin_evidencia'];
  }

  protected estadoBadge(e?: ClaimStatus): string {
    return {
      confirmada:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200',
      refutada:
        'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200',
      sin_evidencia:
        'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
    }[e ?? 'sin_evidencia'];
  }
}
