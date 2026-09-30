import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Spelling, TheoryService } from '../../../core/api/theory.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { FretMarker, Fretboard } from '../../../shared/fretboard/fretboard';
import { NoteNamePipe, typesetNoteName } from '../../../shared/note-name.pipe';
import { PageHeader } from '../../../shared/page-header';
import { roleForChordDegree } from '../../../shared/theory-roles';

const FRET_COUNT = 12;
const INVERSION_KEYS = [
  'fretboardLab.inversion.0',
  'fretboardLab.inversion.1',
  'fretboardLab.inversion.2',
  'fretboardLab.inversion.3',
];

/**
 * Lesson 6: the eleven chord formulas FretLab knows, grouped by how each one differs from a triad
 * already covered in Lesson 5 — a seventh chord adds one more third-like interval on top, while a
 * suspended chord replaces the third itself with a second or a fourth.
 */
@Component({
  selector: 'app-lesson-chords',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, Fretboard, NoteNamePipe, TranslatePipe, RouterLink],
  templateUrl: './chords.html',
  styleUrl: './chords.scss',
})
export class Chords {
  private readonly theory = inject(TheoryService);

  protected readonly spelling = signal<Spelling>('SHARPS');
  protected readonly notes = this.theory.notes(() => ({ spelling: this.spelling() }));
  protected readonly board = this.theory.fretboard(() => ({ frets: FRET_COUNT, spelling: this.spelling() }));
  protected readonly chordTypes = this.theory.chordTypes();

  protected readonly root = signal('C');
  protected readonly typeId = signal<string>('DOMINANT_SEVENTH');
  protected readonly inversion = signal(0);

  protected readonly chord = this.theory.chord(() => ({ root: this.root(), type: this.typeId() }));

  protected readonly inversionOptions = computed(() => {
    const count = this.chord.value()?.notes.length ?? 3;
    return Array.from({ length: count }, (_, i) => ({ value: i, labelKey: INVERSION_KEYS[i] }));
  });

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
