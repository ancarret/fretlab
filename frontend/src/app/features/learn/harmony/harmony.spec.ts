import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ApiNote, FretboardData, HarmonyData, IntervalBetween } from '../../../core/api/theory.service';
import { Harmony } from './harmony';

describe('Harmony', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Harmony],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('shows all seven harmonised degrees with their Roman numerals', async () => {
    const fixture = await renderWith();
    const element = fixture.nativeElement as HTMLElement;

    const romans = Array.from(element.querySelectorAll('.degrees__roman')).map((c) => c.textContent?.trim());
    expect(romans).toEqual(['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']);
  });

  it('reports a leading tone for C major, resolving by a half step', async () => {
    const fixture = await renderWith();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.summary--proof')?.textContent).toContain('B');
    expect(element.querySelector('.summary--proof')?.textContent).toContain('C');
  });

  it('shows the I-IV-V symbols for the current key', async () => {
    const fixture = await renderWith();
    const element = fixture.nativeElement as HTMLElement;
    const text = element.querySelector('.progression')?.textContent ?? '';

    expect(text).toContain('C');
    expect(text).toContain('F');
    expect(text).toContain('G');
  });

  async function renderWith() {
    const fixture = TestBed.createComponent(Harmony);
    fixture.detectChanges();

    httpMock.expectOne((r) => r.url.endsWith('/theory/notes')).flush(notesPayload());
    httpMock.expectOne((r) => r.url.endsWith('/theory/fretboard')).flush(fretboardPayload());
    httpMock.expectOne((r) => r.url.endsWith('/theory/scales/harmonize')).flush(harmonyPayload());
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();

    httpMock.expectOne((r) => r.url.endsWith('/theory/intervals/between')).flush(resolutionPayload());
    await fixture.whenStable();
    fixture.detectChanges();

    return fixture;
  }

  function note(name: string, pitchClass: number): ApiNote {
    return { name, letter: name.charAt(0), accidental: '', pitchClass };
  }

  function notesPayload(): ApiNote[] {
    return [note('C', 0), note('D', 2), note('E', 4), note('F', 5), note('G', 7), note('A', 9), note('B', 11)];
  }

  function chord(root: string, pitchClass: number, symbol: string, typeId: string) {
    return {
      root: note(root, pitchClass),
      type: { id: typeId, displayName: typeId, symbol: '' },
      symbol,
      notes: [note(root, pitchClass)],
      inversion: 0,
      inversionName: 'Root position',
    };
  }

  function harmonyPayload(): HarmonyData {
    return {
      tonic: note('C', 0),
      type: { id: 'MAJOR', displayName: 'Major', degreeCount: 7 },
      degrees: [
        { degree: 1, romanNumeral: 'I', chord: chord('C', 0, 'C', 'MAJOR') },
        { degree: 2, romanNumeral: 'ii', chord: chord('D', 2, 'Dm', 'MINOR') },
        { degree: 3, romanNumeral: 'iii', chord: chord('E', 4, 'Em', 'MINOR') },
        { degree: 4, romanNumeral: 'IV', chord: chord('F', 5, 'F', 'MAJOR') },
        { degree: 5, romanNumeral: 'V', chord: chord('G', 7, 'G', 'MAJOR') },
        { degree: 6, romanNumeral: 'vi', chord: chord('A', 9, 'Am', 'MINOR') },
        { degree: 7, romanNumeral: 'vii°', chord: chord('B', 11, 'Bdim', 'DIMINISHED') },
      ],
    };
  }

  function resolutionPayload(): IntervalBetween {
    return {
      from: note('B', 11),
      to: note('C', 0),
      interval: { id: 'MINOR_SECOND', name: 'Minor second', shorthand: 'm2', number: 2, quality: 'MINOR', semitones: 1 },
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
