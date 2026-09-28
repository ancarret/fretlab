import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FretboardChallenge } from '../../../core/api/practice.service';
import { FretboardData } from '../../../core/api/theory.service';
import { FretboardTrainer } from './fretboard-trainer';

/**
 * Change detection is driven with `detectChanges()` rather than `whenStable()`: both resources
 * keep a request pending until flushed, so awaiting stability first would deadlock.
 */
describe('FretboardTrainer', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FretboardTrainer],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('marks a correct guess as found and grows the score', async () => {
    const fixture = await render();
    const element = fixture.nativeElement as HTMLElement;

    // String 5, fret 3 is C in standard tuning — the fixture's target.
    clickCell(fixture, 'String 5, fret 3');

    expect(element.querySelectorAll('.marker').length).toBe(1);
    expect(element.textContent).toContain('1 found');
  });

  it('reports a wrong guess without placing a marker', async () => {
    const fixture = await render();
    const element = fixture.nativeElement as HTMLElement;

    // String 5, open is A — not the C target. Fret 0 is labelled "open", not "fret 0".
    clickCell(fixture, 'String 5, open');

    expect(element.querySelectorAll('.marker').length).toBe(0);
    expect(element.textContent).toContain("Not quite — that's A.");
  });

  it('ignores clicks on strings outside the current level', async () => {
    const fixture = await render();
    const element = fixture.nativeElement as HTMLElement;

    // Level 1 only plays strings 5–6; string 1 fret 8 is also a C but out of bounds here.
    clickCell(fixture, 'String 1, fret 8');

    expect(element.querySelectorAll('.marker').length).toBe(0);
    expect(element.textContent).toContain('0 found');
  });

  it('requests a new challenge when the level changes', async () => {
    const fixture = await render();

    clickButton(fixture, 'button[title="All six strings, naturals"]');

    const request = httpMock.expectOne((r) => r.url.endsWith('/practice/fretboard/challenge'));
    expect(request.request.params.get('level')).toBe('LEVEL_3');
    request.flush(challenge('LEVEL_3', [1, 2, 3, 4, 5, 6]));
  });

  async function render(): Promise<ComponentFixture<FretboardTrainer>> {
    const fixture = TestBed.createComponent(FretboardTrainer);
    fixture.detectChanges();

    httpMock.expectOne((r) => r.url.endsWith('/practice/fretboard/challenge')).flush(challenge());
    httpMock.expectOne((r) => r.url.endsWith('/theory/fretboard')).flush(board());
    await fixture.whenStable();
    fixture.detectChanges();

    return fixture;
  }

  function clickButton(fixture: ComponentFixture<FretboardTrainer>, selector: string): void {
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(selector)?.click();
    fixture.detectChanges();
  }

  /** Fretboard positions are SVG `<rect>` cells, which have no native `.click()`. */
  function clickCell(fixture: ComponentFixture<FretboardTrainer>, ariaLabel: string): void {
    (fixture.nativeElement as HTMLElement)
      .querySelector<SVGRectElement>(`[aria-label="${ariaLabel}"]`)
      ?.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();
  }

  function challenge(level = 'LEVEL_1', eligibleStrings = [5, 6]): FretboardChallenge {
    return {
      level: level as FretboardChallenge['level'],
      target: { name: 'C', letter: 'C', accidental: '', pitchClass: 0 },
      eligibleStrings,
      includesAccidentals: false,
      timed: false,
    };
  }

  function board(): FretboardData {
    return {
      tuning: { id: 'STANDARD', name: 'Standard', strings: [] },
      fretCount: 12,
      spelling: 'SHARPS',
      positions: [
        position(5, 3, 'C', 0),
        position(5, 0, 'A', 9),
        position(1, 8, 'C', 0),
        position(6, 8, 'C', 0),
      ],
    };
  }

  function position(string: number, fret: number, name: string, pitchClass: number) {
    return { string, fret, octave: 3, note: { name, letter: name, accidental: '', pitchClass } };
  }
});
