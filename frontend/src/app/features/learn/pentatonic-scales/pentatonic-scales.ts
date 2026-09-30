import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Spelling, TheoryService } from '../../../core/api/theory.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { FretMarker, Fretboard } from '../../../shared/fretboard/fretboard';
import { KeyMarker, Piano } from '../../../shared/piano/piano';
import { NoteNamePipe, typesetNoteName } from '../../../shared/note-name.pipe';
import { PageHeader } from '../../../shared/page-header';
import { roleForScaleDegree, SCALE_DEGREE_NUMBERS } from '../../../shared/theory-roles';

const FRET_COUNT = 15;
const PENTATONIC_TYPE_IDS = ['MAJOR_PENTATONIC', 'MINOR_PENTATONIC'] as const;

/** The seven-note scale each pentatonic is a five-note subset of, sharing the same tonic. */
const PARENT_SCALE: Record<string, string> = {
  MAJOR_PENTATONIC: 'MAJOR',
  MINOR_PENTATONIC: 'NATURAL_MINOR',
};

/**
 * Lesson 9 (final): the two pentatonic scales, each proven to be a five-note subset of a
 * seven-note scale already covered in Lesson 7, shown across more of the neck than earlier lessons
 * because a five-note pattern only starts to look like a pattern once there is enough neck to see
 * it repeat.
 *
 * <p>This lesson deliberately does not teach named "box positions" or the CAGED system — seeing
 * every occurrence of a scale is backend-verified fact; a specific five-shape fingering is a claim
 * about hand geometry this project has not encoded or checked against any authoritative source
 * (see `docs/roadmap.md`, Phase 8), so it is not taught here as if it were.
 */
@Component({
  selector: 'app-lesson-pentatonic-scales',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, Fretboard, Piano, NoteNamePipe, TranslatePipe, RouterLink],
  templateUrl: './pentatonic-scales.html',
  styleUrl: './pentatonic-scales.scss',
})
export class PentatonicScales {
  private readonly theory = inject(TheoryService);

  protected readonly spelling = signal<Spelling>('SHARPS');
  protected readonly notes = this.theory.notes(() => ({ spelling: this.spelling() }));
  protected readonly board = this.theory.fretboard(() => ({ frets: FRET_COUNT, spelling: this.spelling() }));

  protected readonly typeIds = PENTATONIC_TYPE_IDS;
  protected readonly tonic = signal('C');
  protected readonly typeId = signal<string>('MAJOR_PENTATONIC');

  protected readonly scale = this.theory.scale(() => ({ tonic: this.tonic(), type: this.typeId() }));

  private readonly degreeNumbers = computed(() => SCALE_DEGREE_NUMBERS[this.typeId()] ?? []);

  protected readonly pianoMarkers = computed<readonly KeyMarker[]>(() => {
    const scale = this.scale.value();
    const degrees = this.degreeNumbers();
    if (!scale) {
      return [];
    }
    return scale.notes.map((note, index) => ({
      pitchClass: note.pitchClass,
      label: typesetNoteName(note.name),
      role: roleForScaleDegree(degrees[index] ?? 0),
    }));
  });

  protected readonly fretboardMarkers = computed<readonly FretMarker[]>(() => {
    const data = this.board.value();
    const scale = this.scale.value();
    const degrees = this.degreeNumbers();
    if (!data || !scale) {
      return [];
    }
    return scale.notes.flatMap((note, index) =>
      data.positions
        .filter((p) => p.note.pitchClass === note.pitchClass)
        .map((p) => ({
          position: { string: p.string, fret: p.fret },
          label: typesetNoteName(p.note.name),
          role: roleForScaleDegree(degrees[index] ?? 0),
          emphasis: 'primary' as const,
        })),
    );
  });

  // ---------- Subset proof: every pentatonic note is also in its seven-note parent scale ----------

  protected readonly parentScale = this.theory.scale(() => ({
    tonic: this.tonic(),
    type: PARENT_SCALE[this.typeId()],
  }));

  /** Which of the parent scale's seven degree numbers this pentatonic formula omits. */
  protected readonly droppedDegrees = computed(() => {
    const present = new Set(this.degreeNumbers());
    return [1, 2, 3, 4, 5, 6, 7].filter((degree) => !present.has(degree));
  });

  /** Every parent-scale note, flagged with whether the pentatonic formula keeps it. */
  protected readonly parentNotesAnnotated = computed(() => {
    const pentaClasses = new Set(this.scale.value()?.notes.map((n) => n.pitchClass));
    return (this.parentScale.value()?.notes ?? []).map((note) => ({
      note,
      kept: pentaClasses.has(note.pitchClass),
    }));
  });

  protected readonly isSubset = computed(() => {
    const parentClasses = new Set(this.parentScale.value()?.notes.map((n) => n.pitchClass));
    const pentaNotes = this.scale.value()?.notes;
    if (!pentaNotes || parentClasses.size === 0) {
      return false;
    }
    return pentaNotes.every((note) => parentClasses.has(note.pitchClass));
  });

  // ---------- Relative pentatonic proof (major pentatonic only, mirroring Lesson 7) ----------

  protected readonly relativeMinorTonic = computed(() => {
    const scale = this.scale.value();
    // Degree numbers for MAJOR_PENTATONIC are [1, 2, 3, 5, 6] — index 4 is the 6th degree.
    return this.typeId() === 'MAJOR_PENTATONIC' && scale ? scale.notes[4]?.name : undefined;
  });

  protected readonly relativePentatonic = this.theory.scale(() => {
    const tonic = this.relativeMinorTonic();
    return tonic ? { tonic, type: 'MINOR_PENTATONIC' } : undefined;
  });

  protected readonly sameNotes = computed(() => {
    const major = this.scale.value()?.notes;
    const minor = this.relativePentatonic.value()?.notes;
    if (!major || !minor || major.length !== minor.length) {
      return false;
    }
    const a = [...major.map((n) => n.pitchClass)].sort((x, y) => x - y);
    const b = [...minor.map((n) => n.pitchClass)].sort((x, y) => x - y);
    return a.every((value, index) => value === b[index]);
  });

  protected setTonic(name: string): void {
    this.tonic.set(name);
  }

  protected setTypeId(id: string): void {
    this.typeId.set(id);
  }

  protected setSpelling(spelling: Spelling): void {
    this.spelling.set(spelling);
  }
}
