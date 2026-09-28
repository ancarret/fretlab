import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Spelling, TheoryService } from '../../../core/api/theory.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { FretMarker, Fretboard } from '../../../shared/fretboard/fretboard';
import { NoteNamePipe, typesetNoteName } from '../../../shared/note-name.pipe';
import { KeyMarker, Piano } from '../../../shared/piano/piano';
import { PageHeader } from '../../../shared/page-header';

/**
 * Lesson 1: the twelve pitch classes, semitones, and why B–C and E–F sit a single fret apart.
 *
 * <p>The piano and the fretboard both read from the same backend note data and the same selected
 * pitch class — clicking a key does not just name a note, it shows every place that exact pitch
 * lives on the neck, which is the entire point of teaching this on a guitar app rather than out of
 * a textbook.
 */
@Component({
  selector: 'app-lesson-foundations',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, Piano, Fretboard, NoteNamePipe, TranslatePipe, RouterLink],
  templateUrl: './foundations.html',
  styleUrl: './foundations.scss',
})
export class LessonFoundations {
  private readonly theory = inject(TheoryService);

  protected readonly spellingOptions = [
    { value: 'SHARPS' as const, labelKey: 'fretboardLab.sharps' },
    { value: 'FLATS' as const, labelKey: 'fretboardLab.flats' },
  ];

  protected readonly spelling = signal<Spelling>('SHARPS');
  protected readonly selectedPitchClass = signal<number | null>(null);

  protected readonly notes = this.theory.notes(() => ({ spelling: this.spelling() }));
  protected readonly board = this.theory.fretboard(() => ({ frets: 12, spelling: this.spelling() }));

  protected readonly selectedNote = computed(() => {
    const selected = this.selectedPitchClass();
    if (selected === null) {
      return null;
    }
    return this.notes.value()?.find((note) => note.pitchClass === selected) ?? null;
  });

  protected readonly pianoMarkers = computed<readonly KeyMarker[]>(() => {
    const note = this.selectedNote();
    if (!note) {
      return [];
    }
    return [{ pitchClass: note.pitchClass, label: typesetNoteName(note.name), role: 'root' }];
  });

  protected readonly fretboardMarkers = computed<readonly FretMarker[]>(() => {
    const data = this.board.value();
    const selected = this.selectedPitchClass();
    if (!data || selected === null) {
      return [];
    }
    return data.positions
      .filter((position) => position.note.pitchClass === selected)
      .map((position) => ({
        position: { string: position.string, fret: position.fret },
        label: typesetNoteName(position.note.name),
        role: 'root' as const,
        emphasis: 'primary' as const,
      }));
  });

  protected readonly matchCount = computed(() => this.fretboardMarkers().length);

  protected selectPitchClass(pitchClass: number): void {
    this.selectedPitchClass.set(pitchClass);
  }

  protected setSpelling(spelling: Spelling): void {
    this.spelling.set(spelling);
  }
}
