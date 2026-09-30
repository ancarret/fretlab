import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ApiInterval, ApiNote, FretboardData } from '../../../core/api/theory.service';
import { Intervals } from './intervals';

describe('Intervals', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Intervals],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists the full interval catalogue', async () => {
    const fixture = await renderWith();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('.catalog__row').length).toBe(intervalsPayload().length);
  });

  it('asks the backend for the interval once both notes are picked', async () => {
    const fixture = await renderWith();

    clickNote(fixture, '#from-note-label', 'C');
    clickNote(fixture, '#to-note-label', 'E');

    httpMock
      .expectOne((r) => r.url.endsWith('/theory/intervals/between'))
      .flush({
        from: notesPayload()[0],
        to: notesPayload()[4],
        interval: intervalsPayload().find((i) => i.id === 'MAJOR_THIRD'),
      });
    await fixture.whenStable();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.summary')?.textContent).toContain('M3');
  });

  it('finds every occurrence of the default root and interval on the neck', async () => {
    const fixture = await renderWith();
    const element = fixture.nativeElement as HTMLElement;
    const findStage = element.querySelector('[aria-label="Find an interval on the neck"]');

    // Default root C + default interval MAJOR_THIRD (4 semitones) -> pitch class 4 (E), 2 matches.
    expect(findStage?.querySelector('.summary')?.textContent).toContain('2');
  });

  function clickNote(fixture: ComponentFixture<Intervals>, groupSelector: string, name: string) {
    const element = fixture.nativeElement as HTMLElement;
    const group = element.querySelector(groupSelector)?.nextElementSibling;
    const buttons = Array.from(group?.querySelectorAll<HTMLButtonElement>('button') ?? []);
    buttons.find((button) => button.textContent?.trim() === name)?.click();
    fixture.detectChanges();
  }

  async function renderWith() {
    const fixture = TestBed.createComponent(Intervals);
    fixture.detectChanges();

    httpMock.expectOne((r) => r.url.endsWith('/theory/notes')).flush(notesPayload());
    httpMock.expectOne((r) => r.url.endsWith('/theory/intervals')).flush(intervalsPayload());
    httpMock.expectOne((r) => r.url.endsWith('/theory/fretboard')).flush(fretboardPayload());
    await fixture.whenStable();
    fixture.detectChanges();

    return fixture;
  }

  function notesPayload(): ApiNote[] {
    return [
      { name: 'C', letter: 'C', accidental: '', pitchClass: 0 },
      { name: 'C#', letter: 'C', accidental: '#', pitchClass: 1 },
      { name: 'D', letter: 'D', accidental: '', pitchClass: 2 },
      { name: 'D#', letter: 'D', accidental: '#', pitchClass: 3 },
      { name: 'E', letter: 'E', accidental: '', pitchClass: 4 },
    ];
  }

  function intervalsPayload(): ApiInterval[] {
    return [
      { id: 'PERFECT_UNISON', name: 'Perfect unison', shorthand: 'P1', number: 1, quality: 'PERFECT', semitones: 0 },
      { id: 'MAJOR_THIRD', name: 'Major third', shorthand: 'M3', number: 3, quality: 'MAJOR', semitones: 4 },
    ];
  }

  function fretboardPayload(): FretboardData {
    return {
      tuning: { id: 'STANDARD', name: 'Standard', strings: [] },
      fretCount: 12,
      spelling: 'SHARPS',
      positions: [
        position(6, 8, 'C', 0),
        position(5, 3, 'C', 0),
        position(6, 12, 'E', 4),
        position(4, 2, 'E', 4),
      ],
    };
  }

  function position(string: number, fret: number, name: string, pitchClass: number) {
    return { string, fret, octave: 3, note: { name, letter: name.charAt(0), accidental: '', pitchClass } };
  }
});
