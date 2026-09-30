import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { Spelling, TheoryService } from '../../core/api/theory.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { FretMarker, FretPosition, Fretboard } from '../../shared/fretboard/fretboard';
import { NoteNamePipe, typesetNoteName } from '../../shared/note-name.pipe';
import { PageHeader } from '../../shared/page-header';
import {
  roleForChordDegree,
  roleForScaleDegree,
  SCALE_DEGREE_NUMBERS,
} from '../../shared/theory-roles';

type ExploreMode = 'notes' | 'chords' | 'scales';

/** Translation key for each inversion index; a triad only ever needs the first three. */
const INVERSION_KEYS = [
  'fretboardLab.inversion.0',
  'fretboardLab.inversion.1',
  'fretboardLab.inversion.2',
  'fretboardLab.inversion.3',
];

/**
 * Free exploration of the neck, driven entirely by the backend theory engine.
 *
 * <p>Two modes share one fretboard: "Notes" highlights every position that sounds a chosen note
 * (the same exercise as "find every C", without the grading), and "Chords" highlights a whole
 * triad or seventh chord at once, colour-coded by degree. Both read from the same theory API —
 * the mode only changes what is asked for and how the answer is drawn.
 */
@Component({
  selector: 'app-fretboard-lab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, Fretboard, NoteNamePipe, TranslatePipe],
  templateUrl: './fretboard-lab.html',
  styleUrl: './fretboard-lab.scss',
})
export class FretboardLab {
  private readonly theory = inject(TheoryService);

  protected readonly modeOptions: readonly { value: ExploreMode; labelKey: string }[] = [
    { value: 'notes', labelKey: 'fretboardLab.mode.notes' },
    { value: 'chords', labelKey: 'fretboardLab.mode.chords' },
    { value: 'scales', labelKey: 'fretboardLab.mode.scales' },
  ];
  protected readonly mode = signal<ExploreMode>('notes');

  protected readonly fretCountOptions = [12, 15, 24] as const;
  protected readonly spellingOptions = [
    { value: 'SHARPS' as const, labelKey: 'fretboardLab.sharps' },
    { value: 'FLATS' as const, labelKey: 'fretboardLab.flats' },
  ];

  protected readonly fretCount = signal(12);
  protected readonly spelling = signal<Spelling>('SHARPS');
  protected readonly showReferenceNotes = signal(true);
  protected readonly selectedPitchClass = signal<number | null>(null);

  protected readonly board = this.theory.fretboard(() => ({
    frets: this.fretCount(),
    spelling: this.spelling(),
  }));

  // ---------- Chords mode ----------

  protected readonly chordRoot = signal('C');
  protected readonly chordTypeId = signal('MAJOR');
  protected readonly inversion = signal(0);

  protected readonly chordTypes = this.theory.chordTypes(() => this.mode() === 'chords');

  /** Fetched only in chords mode, and always in root position — inversion just reorders below. */
  protected readonly chord = this.theory.chord(() =>
    this.mode() === 'chords' ? { root: this.chordRoot(), type: this.chordTypeId() } : undefined,
  );

  protected readonly inversionOptions = computed(() => {
    const count = this.chord.value()?.notes.length ?? 3;
    return Array.from({ length: count }, (_, i) => ({ value: i, labelKey: INVERSION_KEYS[i] }));
  });

  /** The chord's own tones, reordered so the selected inversion's bass note comes first. */
  protected readonly notesInInversion = computed(() => {
    const notes = this.chord.value()?.notes ?? [];
    if (notes.length === 0) {
      return [];
    }
    const offset = this.inversion() % notes.length;
    return [...notes.slice(offset), ...notes.slice(0, offset)];
  });

  protected readonly chordMarkers = computed<readonly FretMarker[]>(() => {
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

  // ---------- Scales mode ----------

  protected readonly scaleTonic = signal('C');
  protected readonly scaleTypeId = signal('MAJOR');

  protected readonly scaleTypes = this.theory.scaleTypes(() => this.mode() === 'scales');

  protected readonly scale = this.theory.scale(() =>
    this.mode() === 'scales' ? { tonic: this.scaleTonic(), type: this.scaleTypeId() } : undefined,
  );

  protected readonly scaleMarkers = computed<readonly FretMarker[]>(() => {
    const data = this.board.value();
    const active = this.scale.value();
    if (!data || !active) {
      return [];
    }
    const degrees = SCALE_DEGREE_NUMBERS[active.type.id] ?? [];
    return active.notes.flatMap((note, index) =>
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

  protected setScaleTonic(tonic: string): void {
    this.scaleTonic.set(tonic);
  }

  protected setScaleType(typeId: string): void {
    this.scaleTypeId.set(typeId);
  }

  protected setMode(mode: ExploreMode): void {
    this.mode.set(mode);
  }

  protected setChordRoot(root: string): void {
    this.chordRoot.set(root);
    this.inversion.set(0);
  }

  protected setChordType(typeId: string): void {
    this.chordTypeId.set(typeId);
    this.inversion.set(0);
  }

  protected setInversion(value: number): void {
    this.inversion.set(value);
  }

  /** The note vocabulary, derived from the response so it always matches the chosen spelling. */
  protected readonly noteOptions = computed(() => {
    const data = this.board.value();
    if (!data) {
      return [];
    }
    const namesByPitchClass = new Map<number, string>();
    for (const position of data.positions) {
      namesByPitchClass.set(position.note.pitchClass, position.note.name);
    }
    return [...namesByPitchClass]
      .sort(([a], [b]) => a - b)
      .map(([pitchClass, name]) => ({ pitchClass, name }));
  });

  protected readonly selectedNoteName = computed(() => {
    const pitchClass = this.selectedPitchClass();
    return this.noteOptions().find((option) => option.pitchClass === pitchClass)?.name ?? null;
  });

  protected readonly markers = computed<readonly FretMarker[]>(() => {
    const data = this.board.value();
    if (!data) {
      return [];
    }
    const selected = this.selectedPitchClass();
    const showReference = this.showReferenceNotes();

    return data.positions
      .map((position) => ({
        position,
        isSelected: selected !== null && position.note.pitchClass === selected,
      }))
      .filter(({ isSelected }) => isSelected || showReference)
      .map(({ position, isSelected }) => ({
        position: { string: position.string, fret: position.fret },
        label: typesetNoteName(position.note.name),
        role: isSelected ? ('root' as const) : ('other' as const),
        emphasis: isSelected ? ('primary' as const) : ('secondary' as const),
      }));
  });

  /** What the shared fretboard actually draws — the active mode decides which marker set wins. */
  protected readonly activeMarkers = computed<readonly FretMarker[]>(() => {
    if (this.mode() === 'chords') return this.chordMarkers();
    if (this.mode() === 'scales') return this.scaleMarkers();
    return this.markers();
  });

  protected readonly matchCount = computed(() => {
    const selected = this.selectedPitchClass();
    if (selected === null) {
      return 0;
    }
    return this.board.value()?.positions.filter((p) => p.note.pitchClass === selected).length ?? 0;
  });

  protected selectPitchClass(pitchClass: number): void {
    this.selectedPitchClass.update((current) => (current === pitchClass ? null : pitchClass));
  }

  /** Clicking anywhere on the neck selects whatever note lives there. */
  protected selectPositionNote(position: FretPosition): void {
    const match = this.board
      .value()
      ?.positions.find((p) => p.string === position.string && p.fret === position.fret);

    if (match) {
      this.selectPitchClass(match.note.pitchClass);
    }
  }

  protected setFretCount(count: number): void {
    this.fretCount.set(count);
  }

  protected setSpelling(spelling: Spelling): void {
    this.spelling.set(spelling);
  }

  protected toggleReferenceNotes(): void {
    this.showReferenceNotes.update((current) => !current);
  }

  protected clearSelection(): void {
    this.selectedPitchClass.set(null);
  }
}
