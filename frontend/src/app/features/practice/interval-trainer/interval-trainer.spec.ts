import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntervalChallenge } from '../../../core/api/practice.service';
import { FretboardData } from '../../../core/api/theory.service';
import { IntervalTrainer } from './interval-trainer';

describe('IntervalTrainer', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntervalTrainer],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('shows the root as a landmark without counting it as found', async () => {
    const fixture = await render();
    const element = fixture.nativeElement as HTMLElement;

    // The root (C, string 5 fret 3) is drawn, but only the target counts towards the score.
    expect(element.querySelectorAll('.marker--root').length).toBe(1);
    expect(element.textContent).toContain('0 found');
  });

  it('marks a correct guess of the target note as found', async () => {
    const fixture = await render();
    const element = fixture.nativeElement as HTMLElement;

    // String 4, fret 2 is E — a major third above the C root in the fixture.
    clickCell(fixture, 'String 4, fret 2');

    expect(element.textContent).toContain('1 found');
    expect(element.querySelectorAll('.marker--third').length).toBe(1);
  });

  it('does not penalise clicking the root itself', async () => {
    const fixture = await render();
    const element = fixture.nativeElement as HTMLElement;

    clickCell(fixture, 'String 5, fret 3');

    expect(element.textContent).not.toContain('Not quite');
    expect(element.textContent).toContain('0 found');
  });

  it('reports a wrong guess', async () => {
    const fixture = await render();
    const element = fixture.nativeElement as HTMLElement;

    // String 5, open is A — neither the root nor the target.
    clickCell(fixture, 'String 5, open');

    expect(element.textContent).toContain("Not quite — that's A.");
  });

  async function render(): Promise<ComponentFixture<IntervalTrainer>> {
    const fixture = TestBed.createComponent(IntervalTrainer);
    fixture.detectChanges();

    httpMock.expectOne((r) => r.url.endsWith('/practice/intervals/challenge')).flush(challenge());
    httpMock.expectOne((r) => r.url.endsWith('/theory/fretboard')).flush(board());
    await fixture.whenStable();
    fixture.detectChanges();

    return fixture;
  }

  function clickCell(fixture: ComponentFixture<IntervalTrainer>, ariaLabel: string): void {
    (fixture.nativeElement as HTMLElement)
      .querySelector<SVGRectElement>(`[aria-label="${ariaLabel}"]`)
      ?.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();
  }

  function challenge(): IntervalChallenge {
    return {
      root: { name: 'C', letter: 'C', accidental: '', pitchClass: 0 },
      interval: { id: 'MAJOR_THIRD', name: 'Major third', shorthand: 'M3', number: 3, quality: 'MAJOR', semitones: 4 },
      target: { name: 'E', letter: 'E', accidental: '', pitchClass: 4 },
    };
  }

  function board(): FretboardData {
    return {
      tuning: { id: 'STANDARD', name: 'Standard', strings: [] },
      fretCount: 12,
      spelling: 'SHARPS',
      positions: [
        position(5, 3, 'C', 0),
        position(4, 2, 'E', 4),
        position(5, 0, 'A', 9),
      ],
    };
  }

  function position(string: number, fret: number, name: string, pitchClass: number) {
    return { string, fret, octave: 3, note: { name, letter: name, accidental: '', pitchClass } };
  }
});
