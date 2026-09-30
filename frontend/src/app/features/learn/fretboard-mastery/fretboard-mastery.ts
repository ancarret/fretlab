import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Spelling, TheoryService } from '../../../core/api/theory.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { FretMarker, Fretboard } from '../../../shared/fretboard/fretboard';
import { NoteNamePipe, typesetNoteName } from '../../../shared/note-name.pipe';
import { PageHeader } from '../../../shared/page-header';

const FRET_COUNT = 12;

interface AnnotatedMatch {
  readonly string: number;
  readonly fret: number;
  readonly label: string;
  readonly upFromOpen: number;
  readonly downFrom12: number;
  readonly nearerAnchor: 'open' | 'twelfth';
}

/**
 * Lesson 3: a method for finding any note anywhere on the neck, instead of counting semitones from
 * fret 1 every time.
 *
 * <p>The method itself is nothing more than the two facts Lesson 2 already established — the open
 * string, and the octave at fret 12 — used as the two nearest reference points for every position
 * in between. No fret-shape or "box position" claim is made here: those describe a specific hand
 * shape, which is real guitar knowledge this project does not encode anywhere in the backend (see
 * `docs/roadmap.md`, Phase 8), so this lesson does not teach it either.
 */
@Component({
  selector: 'app-lesson-fretboard-mastery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, Fretboard, NoteNamePipe, TranslatePipe, RouterLink],
  templateUrl: './fretboard-mastery.html',
  styleUrl: './fretboard-mastery.scss',
})
export class FretboardMastery {
  private readonly theory = inject(TheoryService);

  protected readonly spelling = signal<Spelling>('SHARPS');
  protected readonly board = this.theory.fretboard(() => ({ frets: FRET_COUNT, spelling: this.spelling() }));

  protected readonly selectedPitchClass = signal<number | null>(null);

  /** The note vocabulary, derived from the response so it always matches the chosen spelling. */
  protected readonly noteOptions = computed(() => {
    const data = this.board.value();
    if (!data) {
      return [];
    }
    const byPitchClass = new Map<number, string>();
    for (const position of data.positions) {
      byPitchClass.set(position.note.pitchClass, position.note.name);
    }
    return [...byPitchClass].sort(([a], [b]) => a - b).map(([pitchClass, name]) => ({ pitchClass, name }));
  });

  protected readonly matches = computed<readonly AnnotatedMatch[]>(() => {
    const data = this.board.value();
    const selected = this.selectedPitchClass();
    if (!data || selected === null) {
      return [];
    }
    return data.positions
      .filter((position) => position.note.pitchClass === selected)
      .map((position) => {
        const upFromOpen = position.fret;
        const downFrom12 = FRET_COUNT - position.fret;
        return {
          string: position.string,
          fret: position.fret,
          label: typesetNoteName(position.note.name),
          upFromOpen,
          downFrom12,
          nearerAnchor: upFromOpen <= downFrom12 ? ('open' as const) : ('twelfth' as const),
        };
      })
      .sort((a, b) => a.string - b.string || a.fret - b.fret);
  });

  protected readonly markers = computed<readonly FretMarker[]>(() =>
    this.matches().map((match) => ({
      position: { string: match.string, fret: match.fret },
      label: match.label,
      role: 'root' as const,
      emphasis: 'primary' as const,
    })),
  );

  protected readonly matchCount = computed(() => this.matches().length);

  protected selectPitchClass(pitchClass: number): void {
    this.selectedPitchClass.set(pitchClass);
  }

  protected setSpelling(spelling: Spelling): void {
    this.spelling.set(spelling);
  }
}
