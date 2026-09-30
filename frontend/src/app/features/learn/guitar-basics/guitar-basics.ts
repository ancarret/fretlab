import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Spelling, TheoryService } from '../../../core/api/theory.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { FretMarker, FretPosition, Fretboard } from '../../../shared/fretboard/fretboard';
import { NoteNamePipe, typesetNoteName } from '../../../shared/note-name.pipe';
import { PageHeader } from '../../../shared/page-header';

const FRET_COUNT = 12;
/** String 1 is the thinnest (high E); string 6 is the thickest (low E) — see {@link GuitarBasics}. */
const DEFAULT_STRING = 6;

/**
 * Lesson 2: the six open strings, what a fret physically does, and why fret 12 sounds the same
 * note as the open string, one octave up.
 *
 * <p>Every fact shown here is read off the same {@link TheoryService.fretboard} response the rest
 * of the app uses — including the "walk one string" list and the octave check — rather than typed
 * in from memory, so a tuning change to the backend can never leave this lesson quietly wrong.
 */
@Component({
  selector: 'app-lesson-guitar-basics',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, Fretboard, NoteNamePipe, TranslatePipe, RouterLink],
  templateUrl: './guitar-basics.html',
  styleUrl: './guitar-basics.scss',
})
export class GuitarBasics {
  private readonly theory = inject(TheoryService);

  protected readonly spelling = signal<Spelling>('SHARPS');
  protected readonly board = this.theory.fretboard(() => ({ frets: FRET_COUNT, spelling: this.spelling() }));

  protected readonly walkedString = signal(DEFAULT_STRING);
  protected readonly selectedPosition = signal<FretPosition | null>(null);

  /** The six open notes, string 1 (thinnest) to string 6 (thickest), as the API actually returns them. */
  protected readonly openStrings = computed(() => {
    const data = this.board.value();
    if (!data) {
      return [];
    }
    return data.positions
      .filter((position) => position.fret === 0)
      .sort((a, b) => a.string - b.string);
  });

  /** Every fret of one string, open to 12 — the concrete "one fret, one semitone" example. */
  protected readonly walkedPositions = computed(() => {
    const data = this.board.value();
    const string = this.walkedString();
    if (!data) {
      return [];
    }
    return data.positions
      .filter((position) => position.string === string)
      .sort((a, b) => a.fret - b.fret);
  });

  protected readonly selectedNote = computed(() => {
    const selected = this.selectedPosition();
    const data = this.board.value();
    if (!selected || !data) {
      return null;
    }
    return (
      data.positions.find((p) => p.string === selected.string && p.fret === selected.fret) ?? null
    );
  });

  /** Set once fret 12 is selected on some string, so the octave proof can compare it to fret 0. */
  protected readonly octaveCheck = computed(() => {
    const selected = this.selectedNote();
    if (!selected || selected.fret !== 12) {
      return null;
    }
    const open = this.openStrings().find((p) => p.string === selected.string);
    return open ? { open, twelfth: selected } : null;
  });

  protected readonly markers = computed<readonly FretMarker[]>(() => {
    const selected = this.selectedPosition();
    const landmarks: FretMarker[] = this.openStrings()
      .filter((p) => !selected || p.string !== selected.string || p.fret !== 0)
      .map((p) => ({
        position: { string: p.string, fret: p.fret },
        label: typesetNoteName(p.note.name),
        role: 'other' as const,
        emphasis: 'secondary' as const,
      }));

    const note = this.selectedNote();
    if (!note) {
      return landmarks;
    }
    return [
      ...landmarks,
      {
        position: { string: note.string, fret: note.fret },
        label: typesetNoteName(note.note.name),
        role: 'root' as const,
        emphasis: 'primary' as const,
      },
    ];
  });

  protected selectPosition(position: FretPosition): void {
    this.selectedPosition.set(position);
    this.walkedString.set(position.string);
  }

  protected setSpelling(spelling: Spelling): void {
    this.spelling.set(spelling);
  }
}
