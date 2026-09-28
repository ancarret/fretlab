import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { ApiNote } from './theory.service';

/** Mirrors the backend `Difficulty` enum. */
export type Level = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4' | 'LEVEL_5';

/** Mirrors the backend `FretboardChallengeResponse`. */
export interface FretboardChallenge {
  readonly level: Level;
  readonly target: ApiNote;
  readonly eligibleStrings: number[];
  readonly includesAccidentals: boolean;
  readonly timed: boolean;
}

/** Mirrors the backend `IntervalResponse`. */
export interface ApiInterval {
  readonly id: string;
  readonly name: string;
  readonly shorthand: string;
  readonly number: number;
  readonly quality: string;
  readonly semitones: number;
}

/** Mirrors the backend `IntervalChallengeResponse`. */
export interface IntervalChallenge {
  readonly root: ApiNote;
  readonly interval: ApiInterval;
  readonly target: ApiNote;
}

/**
 * Access to the backend practice engine.
 *
 * <p>The server decides which note to ask for and which strings/accidentals are fair game at each
 * level — that is the one piece of the exercise the client cannot make up itself. Where the target
 * actually sounds on the neck is public theory, already served by {@link TheoryService}; grading a
 * click is just comparing the two, which is presentation logic, not a music-theory computation.
 */
@Injectable({ providedIn: 'root' })
export class PracticeService {
  /** A reactive challenge that refetches whenever the requested level changes. */
  challenge(level: () => Level) {
    return httpResource<FretboardChallenge>(() => ({
      url: `${environment.apiBaseUrl}/practice/fretboard/challenge`,
      params: { level: level() },
    }));
  }

  /** A root + interval pair; call `.reload()` on the result to draw a new one. */
  intervalChallenge() {
    return httpResource<IntervalChallenge>(() => ({
      url: `${environment.apiBaseUrl}/practice/intervals/challenge`,
    }));
  }
}
