import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { FretboardData, FretboardPosition } from '../../../core/api/theory.service';
import { GuitarBasics } from './guitar-basics';

describe('GuitarBasics', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuitarBasics],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists the six open strings from the API', async () => {
    const fixture = await renderWith(fretboardPayload());
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('.strings__row').length).toBe(6);
  });

  it('names the selected position when a string row is clicked', async () => {
    const fixture = await renderWith(fretboardPayload());

    clickText(fixture, '.strings__row', 'E');

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.summary__note')?.textContent?.trim()).toBe('E');
  });

  it('proves fret 12 shares the open string pitch class, one octave up', async () => {
    const fixture = await renderWith(fretboardPayload());
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.summary--proof')).toBeNull();

    const twelfthChip = Array.from(element.querySelectorAll<HTMLButtonElement>('.walk__chip')).find(
      (chip) => chip.querySelector('.walk__fret')?.textContent?.trim() === '12',
    );
    twelfthChip?.click();
    fixture.detectChanges();

    expect(element.querySelector('.summary--proof')?.textContent).toContain('E');
  });

  it('refetches the fretboard when the spelling changes', async () => {
    const fixture = await renderWith(fretboardPayload());

    clickText(fixture, 'button', 'Flats');

    httpMock
      .expectOne((r) => r.url.endsWith('/theory/fretboard') && r.params.get('spelling') === 'FLATS')
      .flush(fretboardPayload());
  });

  function clickText(fixture: ComponentFixture<GuitarBasics>, selector: string, text: string) {
    const elements = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(selector),
    );
    elements.find((el) => el.textContent?.includes(text))?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
  }

  async function renderWith(board: FretboardData) {
    const fixture = TestBed.createComponent(GuitarBasics);
    fixture.detectChanges();

    httpMock.expectOne((r) => r.url.endsWith('/theory/fretboard')).flush(board);
    await fixture.whenStable();
    fixture.detectChanges();

    return fixture;
  }

  /** Low E (string 6) fully walked open→12; the other five strings only need an open note. */
  function fretboardPayload(): FretboardData {
    const positions: FretboardPosition[] = [];
    for (let fret = 0; fret <= 12; fret++) {
      positions.push(note(6, fret, fret === 0 || fret === 12 ? 'E' : `F${fret}`, fret === 12 ? 3 : 2));
    }
    positions.push(note(1, 0, 'E', 4));
    positions.push(note(2, 0, 'B', 3));
    positions.push(note(3, 0, 'G', 3));
    positions.push(note(4, 0, 'D', 3));
    positions.push(note(5, 0, 'A', 2));

    return {
      tuning: { id: 'STANDARD', name: 'Standard', strings: [] },
      fretCount: 12,
      spelling: 'SHARPS',
      positions,
    };
  }

  function note(string: number, fret: number, name: string, octave: number): FretboardPosition {
    return {
      string,
      fret,
      octave,
      note: { name, letter: name.charAt(0), accidental: '', pitchClass: (fret + 4) % 12 },
    };
  }
});
