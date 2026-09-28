import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';

import { Level, PracticeService } from '../../../core/api/practice.service';
import { ProgressService } from '../../../core/api/progress.service';
import { TheoryService } from '../../../core/api/theory.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { FretMarker, FretPosition, Fretboard } from '../../../shared/fretboard/fretboard';
import { NoteNamePipe, typesetNoteName } from '../../../shared/note-name.pipe';
import { PageHeader } from '../../../shared/page-header';

interface LevelOption {
  readonly value: Level;
  readonly label: string;
  readonly hintKey: string;
}

/** Holds a translation key and its params rather than pre-rendered text, so a language switch
 * mid-round retranslates the last feedback instead of freezing it in whichever language it fired in. */
interface Feedback {
  readonly kind: 'correct' | 'wrong';
  readonly key: string;
  readonly params: Record<string, string | number>;
}

const FRET_COUNT = 12;

/**
 * "Find the note": the backend hands out a target and the difficulty rules; this screen fetches
 * the whole neck from the theory API and grades clicks itself by comparing the two. No note names
 * are shown until they are found — showing them all, as the free-exploration Fretboard Lab does,
 * would turn the quiz into a lookup exercise.
 */
@Component({
  selector: 'app-fretboard-trainer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, Fretboard, NoteNamePipe, TranslatePipe],
  templateUrl: './fretboard-trainer.html',
  styleUrl: './fretboard-trainer.scss',
})
export class FretboardTrainer {
  private readonly practice = inject(PracticeService);
  private readonly theory = inject(TheoryService);
  private readonly progress = inject(ProgressService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly levelOptions: readonly LevelOption[] = [
    { value: 'LEVEL_1', label: '1', hintKey: 'fretboardTrainer.level1.hint' },
    { value: 'LEVEL_2', label: '2', hintKey: 'fretboardTrainer.level2.hint' },
    { value: 'LEVEL_3', label: '3', hintKey: 'fretboardTrainer.level3.hint' },
    { value: 'LEVEL_4', label: '4', hintKey: 'fretboardTrainer.level4.hint' },
    { value: 'LEVEL_5', label: '5', hintKey: 'fretboardTrainer.level5.hint' },
  ];

  protected readonly level = signal<Level>('LEVEL_1');
  protected readonly activeLevelOption = computed(() =>
    this.levelOptions.find((option) => option.value === this.level()),
  );
  protected readonly foundPositions = signal<ReadonlySet<string>>(new Set());
  protected readonly feedback = signal<Feedback | null>(null);
  protected readonly correctCount = signal(0);
  protected readonly missCount = signal(0);
  protected readonly elapsedSeconds = signal(0);

  private timerHandle: ReturnType<typeof setInterval> | null = null;

  protected readonly challenge = this.practice.challenge(() => this.level());
  protected readonly board = this.theory.fretboard(() => ({ frets: FRET_COUNT, spelling: 'SHARPS' }));

  /** Every position on the neck where the current target sounds, restricted to this level's strings. */
  protected readonly targetPositions = computed(() => {
    const data = this.board.value();
    const active = this.challenge.value();
    if (!data || !active) {
      return [];
    }
    return data.positions.filter(
      (p) => active.eligibleStrings.includes(p.string) && p.note.pitchClass === active.target.pitchClass,
    );
  });

  protected readonly remaining = computed(() =>
    Math.max(0, this.targetPositions().length - this.foundPositions().size),
  );

  protected readonly isComplete = computed(
    () => this.targetPositions().length > 0 && this.remaining() === 0,
  );

  protected readonly accuracy = computed(() => {
    const attempts = this.correctCount() + this.missCount();
    return attempts === 0 ? null : Math.round((this.correctCount() / attempts) * 100);
  });

  /** Only found positions are drawn — everything else stays blank until the player finds it. */
  protected readonly markers = computed<readonly FretMarker[]>(() => {
    const data = this.board.value();
    if (!data) {
      return [];
    }
    const found = this.foundPositions();
    return data.positions
      .filter((p) => found.has(positionId(p)))
      .map((p) => ({
        position: { string: p.string, fret: p.fret },
        label: typesetNoteName(p.note.name),
        role: 'root' as const,
        emphasis: 'primary' as const,
      }));
  });

  constructor() {
    // A fresh challenge (new target, or a level change) clears the round's found positions,
    // feedback and stopwatch — but not the running session score.
    effect(() => {
      this.challenge.value();
      this.foundPositions.set(new Set());
      this.feedback.set(null);
      this.resetTimer();
    });

    effect(() => {
      if (this.isComplete()) {
        this.stopTimer();
      }
    });

    this.destroyRef.onDestroy(() => this.stopTimer());
  }

  protected setLevel(level: Level): void {
    this.level.set(level);
  }

  protected handlePositionClick(position: FretPosition): void {
    const active = this.challenge.value();
    const data = this.board.value();
    if (!active || !data || this.isComplete()) {
      return;
    }
    if (!active.eligibleStrings.includes(position.string)) {
      return; // Outside this level's strings — not part of the exercise, ignore silently.
    }

    const hit = data.positions.find((p) => p.string === position.string && p.fret === position.fret);
    if (!hit) {
      return;
    }

    if (hit.note.pitchClass === active.target.pitchClass) {
      const id = positionId(hit);
      if (this.foundPositions().has(id)) {
        return; // Already found; clicking it again teaches nothing new.
      }
      this.foundPositions.update((set) => new Set(set).add(id));
      this.correctCount.update((n) => n + 1);
      this.feedback.set({
        kind: 'correct',
        key: 'fretboardTrainer.correct',
        params: { string: position.string, fret: position.fret },
      });
      this.progress.recordAttempt('FRETBOARD_NOTE', true);
    } else {
      this.missCount.update((n) => n + 1);
      this.feedback.set({
        kind: 'wrong',
        key: 'fretboardTrainer.wrong',
        params: { note: typesetNoteName(hit.note.name) },
      });
      this.progress.recordAttempt('FRETBOARD_NOTE', false);
    }
  }

  protected nextChallenge(): void {
    this.challenge.reload();
  }

  private resetTimer(): void {
    this.stopTimer();
    this.elapsedSeconds.set(0);
    if (this.challenge.value()?.timed) {
      this.timerHandle = setInterval(() => this.elapsedSeconds.update((s) => s + 1), 1000);
    }
  }

  private stopTimer(): void {
    if (this.timerHandle !== null) {
      clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
  }
}

function positionId(position: { string: number; fret: number }): string {
  return `s${position.string}f${position.fret}`;
}
