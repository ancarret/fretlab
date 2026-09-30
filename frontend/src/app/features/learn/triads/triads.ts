import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Spelling, TheoryService } from '../../../core/api/theory.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { FretMarker, Fretboard } from '../../../shared/fretboard/fretboard';
import { NoteNamePipe, typesetNoteName } from '../../../shared/note-name.pipe';
import { PageHeader } from '../../../shared/page-header';
import { roleForChordDegree } from '../../../shared/theory-roles';

const FRET_COUNT = 12;
const TRIAD_TYPE_IDS = ['MAJOR', 'MINOR', 'DIMINISHED', 'AUGMENTED'] as const;
const INVERSION_KEYS = ['fretboardLab.inversion.0', 'fretboardLab.inversion.1', 'fretboardLab.inversion.2'];

/**
 * Lesson 5: a triad is a root with two thirds stacked on top of it — this lesson builds all four
 * kinds (major, minor, diminished, augmented) from that one idea, rather than presenting four
 * unrelated note lists to memorise.
 *
 * <p>The "why" panel does not assert that a major triad is a major third plus a minor third — it
 * asks {@code /theory/intervals/between} for the interval between the fetched chord's own root and
 * third, and between its third and fifth, so the stacking is demonstrated on real data rather than
 * stated as a fact to take on faith.
 */
@Component({
  selector: 'app-lesson-triads',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, Fretboard, NoteNamePipe, TranslatePipe, RouterLink],
  templateUrl: './triads.html',
  styleUrl: './triads.scss',
})
export class Triads {
  private readonly theory = inject(TheoryService);

  protected readonly spelling = signal<Spelling>('SHARPS');
  protected readonly notes = this.theory.notes(() => ({ spelling: this.spelling() }));
  protected readonly board = this.theory.fretboard(() => ({ frets: FRET_COUNT, spelling: this.spelling() }));

  protected readonly triadTypeIds = TRIAD_TYPE_IDS;
  protected readonly root = signal('C');
  protected readonly typeId = signal<string>('MAJOR');
  protected readonly inversion = signal(0);

  protected readonly chord = this.theory.chord(() => ({ root: this.root(), type: this.typeId() }));

  protected readonly rootToThird = this.theory.intervalBetween(() => {
    const notes = this.chord.value()?.notes;
    return notes && notes.length >= 2 ? { from: notes[0].name, to: notes[1].name } : undefined;
  });

  protected readonly thirdToFifth = this.theory.intervalBetween(() => {
    const notes = this.chord.value()?.notes;
    return notes && notes.length >= 3 ? { from: notes[1].name, to: notes[2].name } : undefined;
  });

  protected readonly inversionOptions = computed(() =>
    Array.from({ length: 3 }, (_, i) => ({ value: i, labelKey: INVERSION_KEYS[i] })),
  );

  /** The chord's own tones, reordered so the selected inversion's bass note comes first. */
  protected readonly notesInInversion = computed(() => {
    const notes = this.chord.value()?.notes ?? [];
    if (notes.length === 0) {
      return [];
    }
    const offset = this.inversion() % notes.length;
    return [...notes.slice(offset), ...notes.slice(0, offset)];
  });

  protected readonly markers = computed<readonly FretMarker[]>(() => {
    const data = this.board.value();
    const chord = this.chord.value();
    if (!data || !chord) {
      return [];
    }
    return chord.notes.flatMap((note, degree) =>
      data.positions
        .filter((p) => p.note.pitchClass === note.pitchClass)
        .map((p) => ({
          position: { string: p.string, fret: p.fret },
          label: typesetNoteName(p.note.name),
          role: roleForChordDegree(degree, chord.type.id),
          emphasis: 'primary' as const,
        })),
    );
  });

  protected setRoot(name: string): void {
    this.root.set(name);
    this.inversion.set(0);
  }

  protected setTypeId(id: string): void {
    this.typeId.set(id);
    this.inversion.set(0);
  }

  protected setInversion(value: number): void {
    this.inversion.set(value);
  }

  protected setSpelling(spelling: Spelling): void {
    this.spelling.set(spelling);
  }
}
