import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ApiChord, ApiNote, FretboardData } from '../../../core/api/theory.service';
import { Triads } from './triads';

describe('Triads', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Triads],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('builds the default C major triad and shows its three tones', async () => {
    const fixture = await renderWith();
    const element = fixture.nativeElement as HTMLElement;

    const chips = Array.from(element.querySelectorAll('.tones__chip')).map((c) => c.textContent?.trim());
    expect(chips).toEqual(['C', 'E', 'G']);
  });

  it('proves the stacked-thirds formula from the fetched interval data', async () => {
    const fixture = await renderWith();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.summary--proof')?.textContent).toContain('M3');
    expect(element.querySelector('.summary--proof')?.textContent).toContain('m3');
  });

  it('reorders the chip row when an inversion is selected', async () => {
    const fixture = await renderWith();

    clickButton(fixture, 'First inversion');

    const element = fixture.nativeElement as HTMLElement;
    const chips = Array.from(element.querySelectorAll('.tones__chip')).map((c) => c.textContent?.trim());
    expect(chips).toEqual(['E', 'G', 'C']);
  });

  function clickButton(fixture: ComponentFixture<Triads>, text: string) {
    const buttons = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button'),
    );
    buttons.find((button) => button.textContent?.trim() === text)?.click();
    fixture.detectChanges();
  }

  async function renderWith() {
    const fixture = TestBed.createComponent(Triads);
    fixture.detectChanges();

    httpMock.expectOne((r) => r.url.endsWith('/theory/notes')).flush(notesPayload());
    httpMock.expectOne((r) => r.url.endsWith('/theory/fretboard')).flush(fretboardPayload());
    httpMock.expectOne((r) => r.url.endsWith('/theory/chords')).flush(chordPayload());
    fixture.detectChanges();
    // The chord's own value has to propagate through a microtask before the two dependent
    // intervalBetween resources issue their requests — `whenStable` cannot be used here, since it
    // would wait on those same not-yet-flushed requests and deadlock.
    await Promise.resolve();
    fixture.detectChanges();

    httpMock
      .expectOne((r) => r.url.endsWith('/theory/intervals/between') && r.params.get('to') === 'E')
      .flush({ from: note('C', 0), to: note('E', 4), interval: interval('MAJOR_THIRD', 'M3', 4) });
    httpMock
      .expectOne((r) => r.url.endsWith('/theory/intervals/between') && r.params.get('to') === 'G')
      .flush({ from: note('E', 4), to: note('G', 7), interval: interval('MINOR_THIRD', 'm3', 3) });
    await fixture.whenStable();
    fixture.detectChanges();

    return fixture;
  }

  function notesPayload(): ApiNote[] {
    return [note('C', 0), note('E', 4), note('G', 7)];
  }

  function note(name: string, pitchClass: number): ApiNote {
    return { name, letter: name.charAt(0), accidental: '', pitchClass };
  }

  function interval(id: string, shorthand: string, semitones: number) {
    return { id, name: id, shorthand, number: 3, quality: 'MAJOR', semitones };
  }

  function chordPayload(): ApiChord {
    return {
      root: note('C', 0),
      type: { id: 'MAJOR', displayName: 'Major', symbol: '' },
      symbol: 'C',
      notes: [note('C', 0), note('E', 4), note('G', 7)],
      inversion: 0,
      inversionName: 'Root position',
    };
  }

  function fretboardPayload(): FretboardData {
    return {
      tuning: { id: 'STANDARD', name: 'Standard', strings: [] },
      fretCount: 12,
      spelling: 'SHARPS',
      positions: [],
    };
  }
});
