import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { HarmonizableScale, Spelling, TheoryService } from '../../../core/api/theory.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { FretMarker, Fretboard } from '../../../shared/fretboard/fretboard';
import { NoteNamePipe, typesetNoteName } from '../../../shared/note-name.pipe';
import { PageHeader } from '../../../shared/page-header';
import { roleForChordDegree } from '../../../shared/theory-roles';

const FRET_COUNT = 12;
const SCALE_TYPE_IDS: readonly HarmonizableScale[] = [
  'MAJOR',
  'NATURAL_MINOR',
  'HARMONIC_MINOR',
  'MELODIC_MINOR',
];

/**
 * Lesson 8: harmonising a scale means building a triad on every one of its seven degrees at once —
 * this lesson reads those seven triads straight from {@code /theory/scales/harmonize}, including
 * the Roman numeral, rather than deriving chord qualities itself.
 *
 * <p>The "why it resolves" panel asks {@code /theory/intervals/between} for the interval from
 * degree 7 up to the tonic. When the backend reports a half step, degree 7 is a genuine leading
 * tone; when it reports a whole step (natural minor), it is a subtonic instead — the panel reports
 * whichever the data actually says, rather than assuming every scale has a leading tone.
 */
@Component({
  selector: 'app-lesson-harmony',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, Fretboard, NoteNamePipe, TranslatePipe, RouterLink],
  templateUrl: './harmony.html',
  styleUrl: './harmony.scss',
})
export class Harmony {
  private readonly theory = inject(TheoryService);

  protected readonly spelling = signal<Spelling>('SHARPS');
  protected readonly notes = this.theory.notes(() => ({ spelling: this.spelling() }));
  protected readonly board = this.theory.fretboard(() => ({ frets: FRET_COUNT, spelling: this.spelling() }));

  protected readonly scaleTypeIds = SCALE_TYPE_IDS;
  protected readonly tonic = signal('C');
  protected readonly typeId = signal<HarmonizableScale>('MAJOR');
  protected readonly selectedDegree = signal(1);

  protected readonly harmony = this.theory.harmony(() => ({ tonic: this.tonic(), type: this.typeId() }));

  protected readonly selected = computed(() =>
    this.harmony.value()?.degrees.find((d) => d.degree === this.selectedDegree()),
  );

  protected readonly markers = computed<readonly FretMarker[]>(() => {
    const data = this.board.value();
    const chord = this.selected()?.chord;
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

  // ---------- Leading tone / subtonic, verified from the interval endpoint ----------

  private readonly seventhDegreeRoot = computed(
    () => this.harmony.value()?.degrees.find((d) => d.degree === 7)?.chord.root.name,
  );

  protected readonly resolution = this.theory.intervalBetween(() => {
    const seventh = this.seventhDegreeRoot();
    const tonic = this.harmony.value()?.tonic.name;
    return seventh && tonic ? { from: seventh, to: tonic } : undefined;
  });

  protected readonly isLeadingTone = computed(() => this.resolution.value()?.interval.semitones === 1);

  protected selectDegree(degree: number): void {
    this.selectedDegree.set(degree);
  }

  protected setTonic(name: string): void {
    this.tonic.set(name);
    this.selectedDegree.set(1);
  }

  protected setTypeId(id: HarmonizableScale): void {
    this.typeId.set(id);
    this.selectedDegree.set(1);
  }

  protected setSpelling(spelling: Spelling): void {
    this.spelling.set(spelling);
  }
}
