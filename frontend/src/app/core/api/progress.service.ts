import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export type ExerciseType = 'FRETBOARD_NOTE' | 'INTERVAL';

export interface MasteryEntry {
  readonly exerciseType: ExerciseType;
  readonly attempts: number;
  readonly correct: number;
  readonly accuracyPercent: number;
}

export interface ProgressSummary {
  readonly totalAttempts: number;
  readonly mastery: MasteryEntry[];
}

/**
 * Recording an attempt requires an account — theory and practice stay fully usable without one, so
 * every call site checks {@link AuthService.isAuthenticated} first and simply skips recording for
 * an anonymous visitor rather than surfacing an error for something that was never a mistake.
 */
@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  /** A reactive summary that only fetches while signed in, and refetches after each recording. */
  summary() {
    return httpResource<ProgressSummary>(() =>
      this.auth.isAuthenticated() ? `${environment.apiBaseUrl}/progress/summary` : undefined,
    );
  }

  recordAttempt(exerciseType: ExerciseType, correct: boolean): void {
    if (!this.auth.isAuthenticated()) {
      return;
    }
    this.http
      .post(`${environment.apiBaseUrl}/progress/attempts`, { exerciseType, correct })
      .subscribe({ error: () => undefined }); // Best-effort: a failed recording should not interrupt practice.
  }
}
