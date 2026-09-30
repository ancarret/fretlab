import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';

import { PracticeService } from '../../../core/api/practice.service';
import { ProgressService } from '../../../core/api/progress.service';
import { TheoryService } from '../../../core/api/theory.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { TranslationService } from '../../../core/i18n/translation.service';
import { FretMarker, FretPosition, Fretboard } from '../../../shared/fretboard/fretboard';
import { typesetNoteName } from '../../../shared/note-name.pipe';
import { PageHeader } from '../../../shared/page-header';
import { roleForIntervalNumber } from '../../../shared/theory-roles';

interface Feedback {
  readonly kind: 'correct' | 'wrong';
  readonly key: string;
  readonly params: Record<string, string | number>;
}

const FRET_COUNT = 12;

/**
 * "Find the interval": the backend hands out a root and an interval; every occurrence of the root
 * is shown as a landmark, and the player must click every occurrence of the resulting note.
 *
 * <p>The role a found marker gets (third, fifth, seventh, or a generic dot) mirrors the interval's
 * own number, so a major third and a minor third both read as "third" — the same colour the
 * Fretboard Lab and the dashboard's harmony strip already use for that degree.
 */
@Component({
  selector: 'app-interval-trainer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, Fretboard, TranslatePipe],
  templateUrl: './interval-trainer.html',
  styleUrl: './interval-trainer.scss',
})
export class IntervalTrainer {
  private readonly practice = inject(PracticeService);
  private readonly theory = inject(TheoryService);
  private readonly progress = inject(ProgressService);
  private readonly i18n = inject(TranslationService);

  protected readonly foundPositions = signal<ReadonlySet<string>>(new Set());
  protected readonly feedback = signal<Feedback | null>(null);
  protected readonly correctCount = signal(0);
  protected readonly missCount = signal(0);

  protected readonly challenge = this.practice.intervalChallenge();
  protected readonly board = this.theory.fretboard(() => ({ frets: FRET_COUNT, spelling: 'SHARPS' }));

  protected readonly rootPositions = computed(() => {
    const data = this.board.value();
    const active = this.challenge.value();
    if (!data || !active) {
      return [];
    }
    return data.positions.filter((p) => p.note.pitchClass === active.root.pitchClass);
  });

  protected readonly targetPositions = computed(() => {
    const data = this.board.value();
    const active = this.challenge.value();
    if (!data || !active) {
      return [];
    }
    return data.positions.filter((p) => p.note.pitchClass === active.target.pitchClass);
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

  /**
   * Composed here rather than nesting a `noteName`/`translate` pipe inside another pipe's params
   * in the template — an interval's translated name has to be resolved before it can be spliced
   * into the surrounding "find every ___" sentence.
   */
  protected readonly promptText = computed(() => {
    const active = this.challenge.value();
    if (!active) {
      return '';
    }
    const intervalName = this.i18n.t(`interval.${active.interval.id}`);
    const rootName = typesetNoteName(active.root.name);
    const findEvery = this.i18n.t('intervalTrainer.findEvery', { interval: intervalName });
    const above = this.i18n.t('intervalTrainer.above', { root: rootName });
    return `${findEvery} ${above}`;
  });

  protected readonly completionText = computed(() => {
    const active = this.challenge.value();
    return active ? this.i18n.t('intervalTrainer.thatIs', { note: typesetNoteName(active.target.name) }) : '';
  });

  /** The root, always visible as a dim landmark, plus whatever the player has found so far. */
  protected readonly markers = computed<readonly FretMarker[]>(() => {
    const active = this.challenge.value();
    if (!active) {
      return [];
    }
    const found = this.foundPositions();
    const role = roleForIntervalNumber(active.interval.number);

    const roots: FretMarker[] = this.rootPositions().map((p) => ({
      position: { string: p.string, fret: p.fret },
      label: typesetNoteName(p.note.name),
      role: 'root',
      emphasis: 'secondary',
    }));

    const targets: FretMarker[] = this.targetPositions()
      .filter((p) => found.has(positionId(p)))
      .map((p) => ({
        position: { string: p.string, fret: p.fret },
        label: typesetNoteName(p.note.name),
        role,
        emphasis: 'primary',
      }));

    return [...roots, ...targets];
  });

  constructor() {
    effect(() => {
      this.challenge.value();
      this.foundPositions.set(new Set());
      this.feedback.set(null);
    });
  }

  protected handlePositionClick(position: FretPosition): void {
    const active = this.challenge.value();
    const data = this.board.value();
    if (!active || !data || this.isComplete()) {
      return;
    }

    const hit = data.positions.find((p) => p.string === position.string && p.fret === position.fret);
    if (!hit) {
      return;
    }

    if (hit.note.pitchClass === active.target.pitchClass) {
      const id = positionId(hit);
      if (this.foundPositions().has(id)) {
        return;
      }
      this.foundPositions.update((set) => new Set(set).add(id));
      this.correctCount.update((n) => n + 1);
      this.feedback.set({
        kind: 'correct',
        key: 'intervalTrainer.correct',
        params: { string: position.string, fret: position.fret },
      });
      this.progress.recordAttempt('INTERVAL', true);
    } else if (hit.note.pitchClass !== active.root.pitchClass) {
      // A click on the root itself is not a mistake — it is just the landmark, ignore it quietly.
      this.missCount.update((n) => n + 1);
      this.feedback.set({
        kind: 'wrong',
        key: 'intervalTrainer.wrong',
        params: { note: typesetNoteName(hit.note.name) },
      });
      this.progress.recordAttempt('INTERVAL', false);
    }
  }

  protected nextChallenge(): void {
    this.challenge.reload();
  }
}

function positionId(position: { string: number; fret: number }): string {
  return `s${position.string}f${position.fret}`;
}
