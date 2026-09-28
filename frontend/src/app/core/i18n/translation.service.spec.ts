import { TestBed } from '@angular/core/testing';

import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  let service: TranslationService;

  beforeEach(() => {
    try {
      localStorage.clear();
    } catch {
      // Not available in this environment; the service already tolerates that.
    }
    TestBed.configureTestingModule({});
    service = TestBed.inject(TranslationService);
  });

  it('defaults to English', () => {
    expect(service.lang()).toBe('en');
    expect(service.isSpanish()).toBe(false);
  });

  it('toggles between English and Spanish', () => {
    service.toggle();
    expect(service.lang()).toBe('es');

    service.toggle();
    expect(service.lang()).toBe('en');
  });

  it('translates a known key in the active language', () => {
    expect(service.t('nav.dashboard')).toBe('Dashboard');

    service.setLang('es');
    expect(service.t('nav.dashboard')).toBe('Panel');
  });

  it('substitutes {param} placeholders', () => {
    expect(service.t('fretboardTrainer.found', { n: 3 })).toBe('3 found');
  });

  it('returns the raw key when it exists in no dictionary, rather than throwing', () => {
    expect(service.t('this.key.does.not.exist')).toBe('this.key.does.not.exist');
  });
});
