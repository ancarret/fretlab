import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';

describe('App shell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('exposes every top-level section in the navigation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const labels = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>('.nav__link'),
    ).map((link) => link.textContent?.trim());

    expect(labels).toEqual(['Dashboard', 'Learn', 'Fretboard', 'Practice', 'Progress']);
  });
});
