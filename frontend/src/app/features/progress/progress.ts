import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/api/auth.service';
import { ExerciseType, ProgressService } from '../../core/api/progress.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { PageHeader } from '../../shared/page-header';

const EXERCISE_NAME_KEYS: Record<ExerciseType, string> = {
  FRETBOARD_NOTE: 'dashboard.mastery.fretboard',
  INTERVAL: 'dashboard.mastery.intervals',
};

/**
 * The one page in the app whose "placeholder" badge is conditional rather than permanent: once
 * signed in, this reads real recorded attempts; signed out, it explains why there is nothing yet
 * rather than showing fabricated numbers.
 */
@Component({
  selector: 'app-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, RouterLink, TranslatePipe],
  templateUrl: './progress.html',
  styleUrl: './progress.scss',
})
export class Progress {
  protected readonly auth = inject(AuthService);
  private readonly progressService = inject(ProgressService);

  protected readonly summary = this.progressService.summary();

  protected readonly meterSegments = Array.from({ length: 10 }, (_, index) => index);

  protected nameKeyFor(exerciseType: ExerciseType): string {
    return EXERCISE_NAME_KEYS[exerciseType];
  }
}
