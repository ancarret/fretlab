import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Spelling, TheoryService } from '../../../core/api/theory.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { FretMarker, Fretboard } from '../../../shared/fretboard/fretboard';
import { NoteNamePipe, typesetNoteName } from '../../../shared/note-name.pipe';
import { PageHeader } from '../../../shared/page-header';
import { roleForIntervalNumber } from '../../../shared/theory-roles';

const FRET_COUNT = 12;

/**
 * Lesson 4: an interval is two facts — a number (letter-name distance) and a quality (exact
 * semitone distance) — followed by two hands-on activities, both computed entirely by the backend:
 * naming the interval between two chosen notes, and finding every occurrence of a chosen interval
 * above a chosen root across the neck.
 *
 * <p>Neither activity invents a note. "Between" asks {@code /theory/intervals/between} for the
 * answer; "find it on the neck" only adds two already-published integers (a root's pitch class and
 * an interval's semitone count) to know which pitch class to look for, then reads the correctly
 * spelled name for every match straight off the fretboard response — exactly how {@link
 * FretboardMastery} and the Interval Trainer already do it.
 */
@Component({
  selector: 'app-lesson-intervals',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, Fretboard, NoteNamePipe, TranslatePipe, RouterLink],
  templateUrl: './intervals.html',
  styleUrl: './intervals.scss',
})
export class Intervals {
  private readonly theory = inject(TheoryService);

  protected readonly spelling = signal<Spelling>('SHARPS');
  protected readonly notes = this.theory.notes(() => ({ spelling: this.spelling() }));
  protected readonly intervals = this.theory.intervals();
  protected readonly board = this.theory.fretboard(() => ({ frets: FRET_COUNT, spelling: this.spelling() }));

  // ---------- "Between" explorer ----------

  protected readonly fromNote = signal<string | null>(null);
  protected readonly toNote = signal<string | null>(null);

  protected readonly between = this.theory.intervalBetween(() => {
    const from = this.fromNote();
    const to = this.toNote();
    return from && to ? { from, to } : undefined;
  });

  // ---------- "Find it on the neck" explorer ----------

  protected readonly rootNote = signal<string>('C');
  protected readonly intervalId = signal<string>('MAJOR_THIRD');

  private readonly selectedInterval = computed(() =>
    this.intervals.value()?.find((interval) => interval.id === this.intervalId()),
  );

  private readonly rootPitchClass = computed(
    () => this.notes.value()?.find((note) => note.name === this.rootNote())?.pitchClass,
  );

  protected readonly targetPitchClass = computed(() => {
    const root = this.rootPitchClass();
    const interval = this.selectedInterval();
    if (root === undefined || !interval) {
      return null;
    }
    return (root + interval.semitones) % 12;
  });

  protected readonly explorerMarkers = computed<readonly FretMarker[]>(() => {
    const data = this.board.value();
    const target = this.targetPitchClass();
    const interval = this.selectedInterval();
    if (!data || target === null || !interval) {
      return [];
    }
    const role = roleForIntervalNumber(interval.number);
    return data.positions
      .filter((position) => position.note.pitchClass === target)
      .map((position) => ({
        position: { string: position.string, fret: position.fret },
        label: typesetNoteName(position.note.name),
        role,
        emphasis: 'primary' as const,
      }));
  });

  protected readonly explorerMatchCount = computed(() => this.explorerMarkers().length);

  protected selectFromNote(name: string): void {
    this.fromNote.set(name);
  }

  protected selectToNote(name: string): void {
    this.toNote.set(name);
  }

  protected setExplorerRoot(name: string): void {
    this.rootNote.set(name);
  }

  protected setIntervalId(id: string): void {
    this.intervalId.set(id);
  }

  protected setSpelling(spelling: Spelling): void {
    this.spelling.set(spelling);
  }
}
