import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Spelling, TheoryService } from '../../../core/api/theory.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { FretMarker, Fretboard } from '../../../shared/fretboard/fretboard';
import { KeyMarker, Piano } from '../../../shared/piano/piano';
import { NoteNamePipe, typesetNoteName } from '../../../shared/note-name.pipe';
import { PageHeader } from '../../../shared/page-header';
import { roleForScaleDegree, SCALE_DEGREE_NUMBERS } from '../../../shared/theory-roles';

const FRET_COUNT = 12;
const SCALE_TYPE_IDS = ['MAJOR', 'NATURAL_MINOR', 'HARMONIC_MINOR', 'MELODIC_MINOR'] as const;

/**
 * Lesson 7: a scale is a tonic plus a fixed sequence of whole and half steps — this lesson reads
 * that sequence straight off the fetched scale's own notes rather than stating it as a rule to
 * memorise, and then proves that a major scale and its relative minor are, note for note, the same
 * seven pitch classes.
 */
@Component({
  selector: 'app-lesson-scales-and-keys',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, Fretboard, Piano, NoteNamePipe, TranslatePipe, RouterLink],
  templateUrl: './scales-and-keys.html',
  styleUrl: './scales-and-keys.scss',
})
export class ScalesAndKeys {
  private readonly theory = inject(TheoryService);

  protected readonly spelling = signal<Spelling>('SHARPS');
  protected readonly notes = this.theory.notes(() => ({ spelling: this.spelling() }));
  protected readonly board = this.theory.fretboard(() => ({ frets: FRET_COUNT, spelling: this.spelling() }));

  protected readonly scaleTypeIds = SCALE_TYPE_IDS;
  protected readonly tonic = signal('C');
  protected readonly typeId = signal<string>('MAJOR');

  protected readonly scale = this.theory.scale(() => ({ tonic: this.tonic(), type: this.typeId() }));

  private readonly degreeNumbers = computed(() => SCALE_DEGREE_NUMBERS[this.typeId()] ?? []);

  /**
   * Consecutive semitone gaps between scale tones, including the wrap back up to the tonic. Kept
   * as raw numbers here — 1 means a half step and 2 a whole step, translated to "H"/"W" (or their
   * Spanish equivalents) in the template, never hardcoded as English letters in this class.
   */
  protected readonly steps = computed(() => {
    const notes = this.scale.value()?.notes;
    if (!notes || notes.length === 0) {
      return [];
    }
    const classes = notes.map((n) => n.pitchClass);
    return classes.map((pitchClass, index) => {
      const next = classes[(index + 1) % classes.length];
      return ((next - pitchClass) % 12 + 12) % 12;
    });
  });

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

  // ---------- Relative minor proof (major scales only) ----------

  protected readonly relativeMinorTonic = computed(() => {
    const scale = this.scale.value();
    return this.typeId() === 'MAJOR' && scale ? scale.notes[5]?.name : undefined;
  });

  protected readonly relativeMinorScale = this.theory.scale(() => {
    const tonic = this.relativeMinorTonic();
    return tonic ? { tonic, type: 'NATURAL_MINOR' } : undefined;
  });

  protected readonly sameNotes = computed(() => {
    const major = this.scale.value()?.notes;
    const minor = this.relativeMinorScale.value()?.notes;
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
