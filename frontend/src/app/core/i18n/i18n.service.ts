import { Injectable, computed, signal } from '@angular/core';

import {
  SUPPORTED_LOCALES,
  type Locale,
} from '../../models/verification.types';

import { TRANSLATIONS, type TranslationKey } from './translations';

const STORAGE_KEY = 'verifier.locale';

function detectInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en';

  const stored = window.localStorage?.getItem(STORAGE_KEY);
  if (stored && (SUPPORTED_LOCALES as readonly string[]).includes(stored)) {
    return stored as Locale;
  }

  const candidates = window.navigator?.languages?.length
    ? window.navigator.languages
    : window.navigator?.language
      ? [window.navigator.language]
      : [];

  for (const lang of candidates) {
    const short = lang.toLowerCase().split('-')[0];
    if ((SUPPORTED_LOCALES as readonly string[]).includes(short)) {
      return short as Locale;
    }
  }
  return 'en';
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly _locale = signal<Locale>(detectInitialLocale());

  readonly locale = this._locale.asReadonly();
  readonly supportedLocales = SUPPORTED_LOCALES;

  /** Reactive bundle of strings for the active locale (with English fallback). */
  readonly bundle = computed(() => ({
    ...TRANSLATIONS.en,
    ...TRANSLATIONS[this._locale()],
  }));

  setLocale(locale: Locale): void {
    if (!(SUPPORTED_LOCALES as readonly string[]).includes(locale)) return;
    this._locale.set(locale);
    if (typeof window !== 'undefined') {
      window.localStorage?.setItem(STORAGE_KEY, locale);
      window.document?.documentElement.setAttribute('lang', locale);
    }
  }

  /**
   * Translate a key. Falls back to English, then to the key itself.
   * Accepts arbitrary string keys to support computed paths like
   * `verdict.label.${verdict.verdict}`; unknown keys return the key.
   */
  t(key: TranslationKey | string): string {
    const b = this.bundle() as Record<string, string>;
    return b[key] ?? key;
  }
}
