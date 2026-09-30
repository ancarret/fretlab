import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { FretboardData } from '../../../core/api/theory.service';
import { FretboardMastery } from './fretboard-mastery';

describe('FretboardMastery', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FretboardMastery],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('shows no matches before a note is picked', async () => {
    const fixture = await renderWith(fretboardPayload());
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.summary--empty')).not.toBeNull();
    expect(element.querySelectorAll('.matches__row').length).toBe(0);
  });

  it('annotates each match with the nearer anchor, open string or the 12th-fret octave', async () => {
    const fixture = await renderWith(fretboardPayload());

    clickNote(fixture, 'C');

    const element = fixture.nativeElement as HTMLElement;
    const rows = element.querySelectorAll('.matches__row');
    expect(rows.length).toBe(2);
    // Sorted by string ascending: string 5 (fret 10, 2 down from the octave) before string 6 (fret 3, 3 up from open).
    expect(rows[0].querySelector('.matches__reason--twelfth')).not.toBeNull();
    expect(rows[1].querySelector('.matches__reason--open')).not.toBeNull();
  });

  function clickNote(fixture: ComponentFixture<FretboardMastery>, name: string) {
    const buttons = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.picker__note'),
    );
    buttons.find((button) => button.textContent?.trim() === name)?.click();
    fixture.detectChanges();
  }

  async function renderWith(board: FretboardData) {
    const fixture = TestBed.createComponent(FretboardMastery);
    fixture.detectChanges();

    httpMock.expectOne((r) => r.url.endsWith('/theory/fretboard')).flush(board);
    await fixture.whenStable();
    fixture.detectChanges();

    return fixture;
  }

  function fretboardPayload(): FretboardData {
    return {
      tuning: { id: 'STANDARD', name: 'Standard', strings: [] },
      fretCount: 12,
      spelling: 'SHARPS',
      positions: [
        position(6, 3, 'C', 0),
        position(5, 10, 'C', 0),
        position(1, 1, 'C#', 1),
      ],
    };
  }

  function position(string: number, fret: number, name: string, pitchClass: number) {
    return {
      string,
      fret,
      octave: 3,
      note: { name, letter: name.charAt(0), accidental: name.length > 1 ? '#' : '', pitchClass },
    };
  }
});
