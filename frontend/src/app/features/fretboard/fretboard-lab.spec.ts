import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FretboardData } from '../../core/api/theory.service';
import { FretboardLab } from './fretboard-lab';

/**
 * Change detection is driven with `detectChanges()` rather than `whenStable()`: the resource keeps
 * a request pending until it is flushed, so awaiting stability before answering it would deadlock.
 */
describe('FretboardLab', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FretboardLab],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('builds the note vocabulary from what the API returned', async () => {
    const fixture = await renderWith(payload());

    expect(noteChipLabels(fixture)).toEqual(['E', 'F', 'A']);
  });

  it('shows every position as a reference marker before anything is selected', async () => {
    const fixture = await renderWith(payload());
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('.marker').length).toBe(4);
    expect(element.querySelectorAll('.marker--primary').length).toBe(0);
  });

  it('promotes only the selected note and reports how many positions match', async () => {
    const fixture = await renderWith(payload());

    clickButton(fixture, '.note-chip', 'E');

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('.marker--primary').length).toBe(2);
    expect(element.querySelector('.summary')?.textContent).toContain('2');
  });

  it('refetches with the new spelling when it changes', async () => {
    const fixture = await renderWith(payload());

    clickButton(fixture, 'button', 'Flats');

    const request = httpMock.expectOne((candidate) => candidate.url.endsWith('/theory/fretboard'));
    expect(request.request.params.get('spelling')).toBe('FLATS');
    request.flush(payload());
  });

  async function renderWith(data: FretboardData): Promise<ComponentFixture<FretboardLab>> {
    const fixture = TestBed.createComponent(FretboardLab);
    fixture.detectChanges();

    // Flush before awaiting: the resource holds the request open, so waiting first would deadlock.
    httpMock.expectOne((request) => request.url.endsWith('/theory/fretboard')).flush(data);
    await fixture.whenStable();

    return fixture;
  }

  function clickButton(fixture: ComponentFixture<FretboardLab>, selector: string, text: string) {
    const buttons = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(selector),
    );
    buttons.find((button) => button.textContent?.trim() === text)?.click();
    fixture.detectChanges();
  }

  function noteChipLabels(fixture: ComponentFixture<FretboardLab>) {
    return Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.note-chip'),
    ).map((chip) => chip.textContent?.trim());
  }

  function payload(): FretboardData {
    return {
      tuning: { id: 'STANDARD', name: 'Standard', strings: [] },
      fretCount: 1,
      spelling: 'SHARPS',
      positions: [
        position(6, 0, 'E', 4, 2),
        position(6, 1, 'F', 5, 2),
        position(5, 0, 'A', 9, 2),
        position(1, 0, 'E', 4, 4),
      ],
    };
  }

  function position(
    string: number,
    fret: number,
    name: string,
    pitchClass: number,
    octave: number,
  ) {
    return { string, fret, octave, note: { name, letter: name, accidental: '', pitchClass } };
  }

  describe('chords mode', () => {
    it('fetches chord types and the chord only after switching modes', async () => {
      const fixture = await renderWith(chordPayload());

      clickButton(fixture, 'button', 'Chords');

      httpMock.expectOne((r) => r.url.endsWith('/theory/chords/types')).flush([
        { id: 'MAJOR', displayName: 'Major', symbol: '' },
        { id: 'MINOR', displayName: 'Minor', symbol: 'm' },
      ]);
      httpMock.expectOne((r) => r.url.endsWith('/theory/chords')).flush(cMajor());
      await fixture.whenStable();
      fixture.detectChanges();

      const element = fixture.nativeElement as HTMLElement;
      expect(element.textContent).toContain('Major chord');
    });

    it('highlights root, third and fifth with distinct roles', async () => {
      const fixture = await renderIntoChordsMode();
      const element = fixture.nativeElement as HTMLElement;

      expect(element.querySelectorAll('.marker--root').length).toBe(1);
      expect(element.querySelectorAll('.marker--third').length).toBe(1);
      expect(element.querySelectorAll('.marker--fifth').length).toBe(1);
    });

    it('reorders the notes strip when a different inversion is selected', async () => {
      const fixture = await renderIntoChordsMode();

      clickButton(fixture, '.inversion-chip', 'First inversion');

      const notes = Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll('.notes-in-order__note'),
      ).map((el) => el.textContent?.trim());
      expect(notes).toEqual(['E', 'G', 'C']);
    });

    async function renderIntoChordsMode(): Promise<ComponentFixture<FretboardLab>> {
      const fixture = await renderWith(chordPayload());
      clickButton(fixture, 'button', 'Chords');

      httpMock.expectOne((r) => r.url.endsWith('/theory/chords/types')).flush([
        { id: 'MAJOR', displayName: 'Major', symbol: '' },
      ]);
      httpMock.expectOne((r) => r.url.endsWith('/theory/chords')).flush(cMajor());
      await fixture.whenStable();
      fixture.detectChanges();
      return fixture;
    }

    function chordPayload(): FretboardData {
      return {
        tuning: { id: 'STANDARD', name: 'Standard', strings: [] },
        fretCount: 1,
        spelling: 'SHARPS',
        positions: [
          position(5, 3, 'C', 0, 3),
          position(4, 2, 'E', 4, 3),
          position(3, 0, 'G', 7, 3),
        ],
      };
    }

    function cMajor() {
      return {
        root: { name: 'C', letter: 'C', accidental: '', pitchClass: 0 },
        type: { id: 'MAJOR', displayName: 'Major', symbol: '' },
        symbol: 'C',
        inversion: 0,
        inversionName: 'Root position',
        notes: [
          { name: 'C', letter: 'C', accidental: '', pitchClass: 0 },
          { name: 'E', letter: 'E', accidental: '', pitchClass: 4 },
          { name: 'G', letter: 'G', accidental: '', pitchClass: 7 },
        ],
      };
    }
  });

  describe('scales mode', () => {
    it('highlights root, third, fifth and a plain second degree', async () => {
      const fixture = await renderWith(scalePositions());

      clickButton(fixture, 'button', 'Scales');
      httpMock.expectOne((r) => r.url.endsWith('/theory/scales/types')).flush([
        { id: 'MAJOR', displayName: 'Major', degreeCount: 7 },
      ]);
      httpMock.expectOne((r) => r.url.endsWith('/theory/scales')).flush(cMajorScale());
      await fixture.whenStable();
      fixture.detectChanges();

      const element = fixture.nativeElement as HTMLElement;
      expect(element.querySelectorAll('.marker--root').length).toBe(1);
      expect(element.querySelectorAll('.marker--third').length).toBe(1);
      expect(element.querySelectorAll('.marker--fifth').length).toBe(1);
      expect(element.querySelectorAll('.marker--other').length).toBe(1); // the D (2nd degree)
      expect(element.textContent).toContain('7-note scale');
    });

    function scalePositions(): FretboardData {
      return {
        tuning: { id: 'STANDARD', name: 'Standard', strings: [] },
        fretCount: 1,
        spelling: 'SHARPS',
        positions: [
          position(5, 3, 'C', 0, 3),
          position(4, 0, 'D', 2, 3),
          position(4, 2, 'E', 4, 3),
          position(3, 0, 'G', 7, 3),
        ],
      };
    }

    function cMajorScale() {
      const note = (name: string, pitchClass: number) => ({
        name,
        letter: name,
        accidental: '',
        pitchClass,
      });
      return {
        tonic: note('C', 0),
        type: { id: 'MAJOR', displayName: 'Major', degreeCount: 7 },
        notes: [
          note('C', 0),
          note('D', 2),
          note('E', 4),
          note('F', 5),
          note('G', 7),
          note('A', 9),
          note('B', 11),
        ],
      };
    }
  });
});
