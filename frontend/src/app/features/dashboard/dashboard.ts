import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { HarmonizableScale, TheoryService } from '../../core/api/theory.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { NoteNamePipe } from '../../shared/note-name.pipe';
import { PageHeader } from '../../shared/page-header';

interface MasteryTopic {
  readonly nameKey: string;
  readonly percentage: number;
}

interface ScaleOption {
  readonly value: HarmonizableScale;
  readonly labelKey: string;
  readonly phraseKey: string;
}

/**
 * Landing screen.
 *
 * <p>Only the key study is live: it asks the backend to harmonise a scale and draws the answer.
 * Everything else is design placeholder — there are no lessons, exercises or progress yet — and
 * each of those sections carries the placeholder badge rather than implying otherwise.
 */
@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, RouterLink, NoteNamePipe, TranslatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly theory = inject(TheoryService);

  protected readonly tonicOptions = ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb'] as const;
  protected readonly scaleOptions: readonly ScaleOption[] = [
    { value: 'MAJOR', labelKey: 'dashboard.scaleOption.major', phraseKey: 'dashboard.scale.major' },
    { value: 'NATURAL_MINOR', labelKey: 'dashboard.scaleOption.naturalMinor', phraseKey: 'dashboard.scale.naturalMinor' },
    { value: 'HARMONIC_MINOR', labelKey: 'dashboard.scaleOption.harmonicMinor', phraseKey: 'dashboard.scale.harmonicMinor' },
  ];

  protected readonly tonic = signal<string>('C');
  protected readonly scale = signal<HarmonizableScale>('MAJOR');

  /** The translation key for the scale word as it appears inside "the chords of X ___". */
  protected readonly scalePhraseKey = computed(
    () => this.scaleOptions.find((option) => option.value === this.scale())?.phraseKey ?? '',
  );

  protected readonly harmony = this.theory.harmony(() => ({
    tonic: this.tonic(),
    type: this.scale(),
  }));

  protected readonly mastery: readonly MasteryTopic[] = [
    { nameKey: 'dashboard.mastery.fretboard', percentage: 0 },
    { nameKey: 'dashboard.mastery.intervals', percentage: 0 },
    { nameKey: 'dashboard.mastery.chords', percentage: 0 },
    { nameKey: 'dashboard.mastery.scales', percentage: 0 },
    { nameKey: 'dashboard.mastery.harmony', percentage: 0 },
    { nameKey: 'dashboard.mastery.caged', percentage: 0 },
  ];

  /** Ten segments per meter, like ten frets: filled segments show mastery at a glance. */
  protected readonly meterSegments = Array.from({ length: 10 }, (_, index) => index);
}
