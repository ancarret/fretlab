import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ApiChord, ApiChordType, ApiNote, FretboardData } from '../../../core/api/theory.service';
import { Chords } from './chords';

describe('Chords', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chords],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('builds the default C dominant 7th and shows its four tones', async () => {
    const fixture = await renderWith();
    const element = fixture.nativeElement as HTMLElement;

    const chips = Array.from(element.querySelectorAll('.tones__chip')).map((c) => c.textContent?.trim());
    expect(chips).toEqual(['C', 'E', 'G', 'B♭']);
    expect(element.querySelector('.symbol')?.textContent).toBe('C7');
  });

  it('offers four inversions for a four-note chord', async () => {
    const fixture = await renderWith();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('.inversions .fl-segmented button').length).toBe(4);
  });

  async function renderWith() {
    const fixture = TestBed.createComponent(Chords);
    fixture.detectChanges();

    httpMock.expectOne((r) => r.url.endsWith('/theory/notes')).flush(notesPayload());
    httpMock.expectOne((r) => r.url.endsWith('/theory/fretboard')).flush(fretboardPayload());
    httpMock.expectOne((r) => r.url.endsWith('/theory/chords/types')).flush(chordTypesPayload());
    httpMock.expectOne((r) => r.url.endsWith('/theory/chords')).flush(chordPayload());
    await fixture.whenStable();
    fixture.detectChanges();

    return fixture;
  }

  function notesPayload(): ApiNote[] {
    return [note('C', 0), note('E', 4), note('G', 7), note('Bb', 10)];
  }

  function note(name: string, pitchClass: number): ApiNote {
    return { name, letter: name.charAt(0), accidental: name.length > 1 ? 'b' : '', pitchClass };
  }

  function chordTypesPayload(): ApiChordType[] {
    return [
      { id: 'MAJOR', displayName: 'Major', symbol: '' },
      { id: 'DOMINANT_SEVENTH', displayName: 'Dominant 7th', symbol: '7' },
    ];
  }

  function chordPayload(): ApiChord {
    return {
      root: note('C', 0),
      type: { id: 'DOMINANT_SEVENTH', displayName: 'Dominant 7th', symbol: '7' },
      symbol: 'C7',
      notes: [note('C', 0), note('E', 4), note('G', 7), note('Bb', 10)],
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
