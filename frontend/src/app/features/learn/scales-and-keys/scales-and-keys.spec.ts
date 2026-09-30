import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ApiNote, ApiScale, FretboardData } from '../../../core/api/theory.service';
import { ScalesAndKeys } from './scales-and-keys';

describe('ScalesAndKeys', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScalesAndKeys],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('reads the whole/half step pattern off the fetched C major scale', async () => {
    const fixture = await renderWith();
    const element = fixture.nativeElement as HTMLElement;

    const steps = Array.from(element.querySelectorAll('.steps__chip')).map((c) => c.textContent?.trim());
    expect(steps).toEqual(['W', 'W', 'H', 'W', 'W', 'W', 'H']);
  });

  it('proves the relative minor shares the same seven notes as the major scale', async () => {
    const fixture = await renderWith();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.summary--proof')?.textContent).toContain('A');

    const rows = Array.from(element.querySelectorAll('.compare__notes')).map((row) =>
      Array.from(row.querySelectorAll('.compare__chip')).map((c) => c.textContent?.trim()),
    );
    expect(rows.length).toBe(2);
    expect(new Set(rows[0])).toEqual(new Set(rows[1]));
  });

  async function renderWith() {
    const fixture = TestBed.createComponent(ScalesAndKeys);
    fixture.detectChanges();

    httpMock.expectOne((r) => r.url.endsWith('/theory/notes')).flush(notesPayload());
    httpMock.expectOne((r) => r.url.endsWith('/theory/fretboard')).flush(fretboardPayload());
    httpMock
      .expectOne((r) => r.url.endsWith('/theory/scales') && r.params.get('tonic') === 'C')
      .flush(cMajorPayload());
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();

    httpMock
      .expectOne((r) => r.url.endsWith('/theory/scales') && r.params.get('tonic') === 'A')
      .flush(aMinorPayload());
    await fixture.whenStable();
    fixture.detectChanges();

    return fixture;
  }

  function notesPayload(): ApiNote[] {
    return ['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((name, i) => note(name, [0, 2, 4, 5, 7, 9, 11][i]));
  }

  function note(name: string, pitchClass: number): ApiNote {
    return { name, letter: name, accidental: '', pitchClass };
  }

  function cMajorPayload(): ApiScale {
    return {
      tonic: note('C', 0),
      type: { id: 'MAJOR', displayName: 'Major', degreeCount: 7 },
      notes: [note('C', 0), note('D', 2), note('E', 4), note('F', 5), note('G', 7), note('A', 9), note('B', 11)],
    };
  }

  function aMinorPayload(): ApiScale {
    return {
      tonic: note('A', 9),
      type: { id: 'NATURAL_MINOR', displayName: 'Natural minor', degreeCount: 7 },
      notes: [note('A', 9), note('B', 11), note('C', 0), note('D', 2), note('E', 4), note('F', 5), note('G', 7)],
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
