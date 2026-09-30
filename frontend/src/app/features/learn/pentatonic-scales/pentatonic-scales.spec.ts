import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ApiNote, ApiScale, FretboardData } from '../../../core/api/theory.service';
import { PentatonicScales } from './pentatonic-scales';

describe('PentatonicScales', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PentatonicScales],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('names the two dropped degrees of the major pentatonic', async () => {
    const fixture = await renderWith();
    const element = fixture.nativeElement as HTMLElement;
    const text = element.querySelector('.dropped')?.textContent ?? '';

    expect(text).toContain('4');
    expect(text).toContain('7');
  });

  it('proves every pentatonic note is also in the parent major scale', async () => {
    const fixture = await renderWith();
    const element = fixture.nativeElement as HTMLElement;

    const rows = Array.from(element.querySelectorAll('.compare__notes'));
    expect(rows.length).toBe(2);
    const keptInParentRow = rows[0].querySelectorAll('.compare__chip--kept').length;
    expect(keptInParentRow).toBe(5);
    expect(element.querySelector('.summary--proof')).not.toBeNull();
  });

  it('proves A minor pentatonic is the relative of C major pentatonic', async () => {
    const fixture = await renderWith();
    const element = fixture.nativeElement as HTMLElement;
    const proofs = Array.from(element.querySelectorAll('.summary--proof')).map((p) => p.textContent);

    expect(proofs.some((text) => text?.includes('A'))).toBe(true);
  });

  async function renderWith() {
    const fixture = TestBed.createComponent(PentatonicScales);
    fixture.detectChanges();

    httpMock.expectOne((r) => r.url.endsWith('/theory/notes')).flush(notesPayload());
    httpMock.expectOne((r) => r.url.endsWith('/theory/fretboard')).flush(fretboardPayload());
    httpMock
      .expectOne((r) => r.url.endsWith('/theory/scales') && r.params.get('type') === 'MAJOR_PENTATONIC')
      .flush(cMajorPentatonicPayload());
    httpMock
      .expectOne((r) => r.url.endsWith('/theory/scales') && r.params.get('type') === 'MAJOR')
      .flush(cMajorPayload());
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();

    httpMock
      .expectOne((r) => r.url.endsWith('/theory/scales') && r.params.get('type') === 'MINOR_PENTATONIC')
      .flush(aMinorPentatonicPayload());
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

  function cMajorPentatonicPayload(): ApiScale {
    return {
      tonic: note('C', 0),
      type: { id: 'MAJOR_PENTATONIC', displayName: 'Major pentatonic', degreeCount: 5 },
      notes: [note('C', 0), note('D', 2), note('E', 4), note('G', 7), note('A', 9)],
    };
  }

  function cMajorPayload(): ApiScale {
    return {
      tonic: note('C', 0),
      type: { id: 'MAJOR', displayName: 'Major', degreeCount: 7 },
      notes: [note('C', 0), note('D', 2), note('E', 4), note('F', 5), note('G', 7), note('A', 9), note('B', 11)],
    };
  }

  function aMinorPentatonicPayload(): ApiScale {
    return {
      tonic: note('A', 9),
      type: { id: 'MINOR_PENTATONIC', displayName: 'Minor pentatonic', degreeCount: 5 },
      notes: [note('A', 9), note('C', 0), note('D', 2), note('E', 4), note('G', 7)],
    };
  }

  function fretboardPayload(): FretboardData {
    return {
      tuning: { id: 'STANDARD', name: 'Standard', strings: [] },
      fretCount: 15,
      spelling: 'SHARPS',
      positions: [],
    };
  }
});
