import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ApiNote, FretboardData } from '../../../core/api/theory.service';
import { LessonFoundations } from './foundations';

describe('LessonFoundations', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LessonFoundations],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('shows no note selected and no fretboard before any key is pressed', async () => {
    const fixture = await renderWith(notesPayload(), fretboardPayload());
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.summary--empty')).not.toBeNull();
    expect(element.querySelector('app-fretboard')).toBeNull();
  });

  it('names the pressed key and highlights every matching fret', async () => {
    const fixture = await renderWith(notesPayload(), fretboardPayload());

    pressPianoKey(fixture, 0); // C

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.summary__note')?.textContent?.trim()).toBe('C');
    expect(element.querySelector('.summary')?.textContent).toContain('2');
    expect(element.querySelectorAll('app-fretboard .marker').length).toBe(2);
  });

  it('refetches both notes and the fretboard when the spelling changes', async () => {
    const fixture = await renderWith(notesPayload(), fretboardPayload());

    clickButton(fixture, 'Flats');

    httpMock.expectOne((r) => r.url.endsWith('/theory/notes') && r.params.get('spelling') === 'FLATS')
      .flush(notesPayload());
    httpMock
      .expectOne((r) => r.url.endsWith('/theory/fretboard') && r.params.get('spelling') === 'FLATS')
      .flush(fretboardPayload());
  });

  function pressPianoKey(fixture: ComponentFixture<LessonFoundations>, pitchClass: number) {
    (fixture.nativeElement as HTMLElement)
      .querySelector<SVGRectElement>(`[aria-label="Pitch class ${pitchClass}"]`)
      ?.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();
  }

  function clickButton(fixture: ComponentFixture<LessonFoundations>, text: string) {
    const buttons = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button'),
    );
    buttons.find((button) => button.textContent?.trim() === text)?.click();
    fixture.detectChanges();
  }

  async function renderWith(notes: ApiNote[], board: FretboardData) {
    const fixture = TestBed.createComponent(LessonFoundations);
    fixture.detectChanges();

    httpMock.expectOne((r) => r.url.endsWith('/theory/notes')).flush(notes);
    httpMock.expectOne((r) => r.url.endsWith('/theory/fretboard')).flush(board);
    await fixture.whenStable();
    fixture.detectChanges();

    return fixture;
  }

  function notesPayload(): ApiNote[] {
    return [
      { name: 'C', letter: 'C', accidental: '', pitchClass: 0 },
      { name: 'C#', letter: 'C', accidental: '#', pitchClass: 1 },
    ];
  }

  function fretboardPayload(): FretboardData {
    return {
      tuning: { id: 'STANDARD', name: 'Standard', strings: [] },
      fretCount: 12,
      spelling: 'SHARPS',
      positions: [
        position(6, 8, 'C', 0, 3),
        position(5, 3, 'C', 0, 3),
        position(1, 1, 'C#', 1, 5),
      ],
    };
  }

  function position(string: number, fret: number, name: string, pitchClass: number, octave: number) {
    return { string, fret, octave, note: { name, letter: name.charAt(0), accidental: name.length > 1 ? '#' : '', pitchClass } };
  }
});
