import { Injectable, computed, signal } from '@angular/core';

import { TRANSLATIONS } from './translations';

export type Lang = 'en' | 'es';

const STORAGE_KEY = 'fretlab.lang';

/**
 * A runtime language switch, not Angular's built-in `@angular/localize`.
 *
 * <p>`@angular/localize` compiles one bundle per locale, which is the right tool when a deployment
 * serves each locale from its own URL. FretLab wants a single running app where a visitor flips a
 * switch and the same page re-renders in the other language — that needs translation lookups
 * resolved at runtime from a signal, which is what this service and {@link TranslatePipe} do.
 *
 * <p>Note names (C, F♯, Bdim...) are never translated. They are music notation, not UI copy, and
 * FretLab's letter-name convention is the same one used internationally in the English-speaking
 * pedagogical tradition this app already follows — switching them to solfège (Do, Fa♯) would be a
 * separate, considerably bigger decision about which notation system to teach, not a translation.
 */
@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly langState = signal<Lang>(readStoredLang());

  readonly lang = this.langState.asReadonly();
  readonly isSpanish = computed(() => this.langState() === 'es');

  setLang(lang: Lang): void {
    this.langState.set(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Private browsing, etc. — the choice just will not survive a reload.
    }
  }

  toggle(): void {
    this.setLang(this.langState() === 'en' ? 'es' : 'en');
  }

  /**
   * The same lookup {@link TranslatePipe} uses, exposed directly for the rare case a component
   * needs to compose one translated phrase from another (an interval's name inside a sentence
   * about it) rather than interpolate a single key straight into a template.
   */
  t(key: string, params?: Record<string, string | number>): string {
    const dictionary = TRANSLATIONS[this.langState()];
    let text = dictionary[key] ?? TRANSLATIONS.en[key] ?? key;

    if (params) {
      for (const [name, value] of Object.entries(params)) {
        text = text.replace(`{${name}}`, String(value));
      }
    }
    return text;
  }
}

function readStoredLang(): Lang {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'es' ? 'es' : 'en';
  } catch {
    return 'en';
  }
}
