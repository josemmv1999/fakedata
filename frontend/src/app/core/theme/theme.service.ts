import { Injectable, computed, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';
export type EffectiveTheme = 'light' | 'dark';

const STORAGE_KEY = 'verifier.theme';
const VALID: readonly ThemeMode[] = ['light', 'dark', 'system'] as const;

function readStored(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  const v = window.localStorage?.getItem(STORAGE_KEY);
  return (VALID as readonly string[]).includes(v ?? '') ? (v as ThemeMode) : 'system';
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _mode = signal<ThemeMode>(readStored());
  private readonly _systemDark = signal<boolean>(this.matchesSystemDark());

  readonly mode = this._mode.asReadonly();
  readonly effective = computed<EffectiveTheme>(() => {
    const m = this._mode();
    if (m === 'system') return this._systemDark() ? 'dark' : 'light';
    return m;
  });

  constructor() {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', (e) => this._systemDark.set(e.matches));
    this.applyClass(this.effective());
  }

  setMode(mode: ThemeMode): void {
    if (!(VALID as readonly string[]).includes(mode)) return;
    this._mode.set(mode);
    if (typeof window !== 'undefined') {
      window.localStorage?.setItem(STORAGE_KEY, mode);
    }
    this.applyClass(this.effective());
  }

  /** Cycle through system → light → dark → system. */
  cycle(): void {
    const next: Record<ThemeMode, ThemeMode> = {
      system: 'light',
      light: 'dark',
      dark: 'system',
    };
    this.setMode(next[this._mode()]);
  }

  private matchesSystemDark(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }

  private applyClass(effective: EffectiveTheme): void {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    html.classList.toggle('dark', effective === 'dark');
  }
}
