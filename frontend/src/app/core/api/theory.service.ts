import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';

/** Default spelling for the five pitch classes that have no natural name. */
export type Spelling = 'SHARPS' | 'FLATS';

/** Mirrors the backend `NoteResponse`. */
export interface ApiNote {
  readonly name: string;
  readonly letter: string;
  readonly accidental: string;
  readonly pitchClass: number;
}

export interface FretboardPosition {
  readonly string: number;
  readonly fret: number;
  readonly note: ApiNote;
  readonly octave: number;
}

export interface TuningString {
  readonly number: number;
  readonly openNote: ApiNote;
  readonly octave: number;
}

export interface FretboardData {
  readonly tuning: { readonly id: string; readonly name: string; readonly strings: TuningString[] };
  readonly fretCount: number;
  readonly spelling: Spelling;
  readonly positions: FretboardPosition[];
}

/** Mirrors the backend `ChordTypeResponse`. */
export interface ApiChordType {
  readonly id: string;
  readonly displayName: string;
  readonly symbol: string;
}

/** Mirrors the backend `ChordResponse`. */
export interface ApiChord {
  readonly root: ApiNote;
  readonly type: ApiChordType;
  readonly symbol: string;
  readonly notes: ApiNote[];
  readonly inversion: number;
  readonly inversionName: string;
}

export interface ChordQuery {
  readonly root: string;
  readonly type: string;
}

/** Mirrors the backend `HarmonizeResponse`: one triad per scale degree. */
export interface HarmonyData {
  readonly tonic: ApiNote;
  readonly type: { readonly id: string; readonly displayName: string; readonly degreeCount: number };
  readonly degrees: { readonly degree: number; readonly romanNumeral: string; readonly chord: ApiChord }[];
}

export type HarmonizableScale = 'MAJOR' | 'NATURAL_MINOR' | 'HARMONIC_MINOR' | 'MELODIC_MINOR';

export interface HarmonyQuery {
  readonly tonic: string;
  readonly type: HarmonizableScale;
}

/** Mirrors the backend `ScaleTypeResponse`. */
export interface ApiScaleType {
  readonly id: string;
  readonly displayName: string;
  readonly degreeCount: number;
}

/** Mirrors the backend `ScaleResponse`. */
export interface ApiScale {
  readonly tonic: ApiNote;
  readonly type: ApiScaleType;
  readonly notes: ApiNote[];
}

export interface ScaleQuery {
  readonly tonic: string;
  readonly type: string;
}

export interface FretboardQuery {
  readonly frets: number;
  readonly spelling: Spelling;
}

/**
 * Access to the backend music theory engine.
 *
 * <p>Every note name this application shows comes from here. The frontend never works out what
 * sounds at a fret — that rule lives in the Java domain, and asking for it keeps one source of
 * truth instead of two implementations that will eventually disagree.
 */
@Injectable({ providedIn: 'root' })
export class TheoryService {
  /**
   * A reactive view of the whole neck that refetches whenever the query signal changes.
   *
   * <p>Call this from an injection context, such as a component field initialiser.
   */
  fretboard(query: () => FretboardQuery) {
    return httpResource<FretboardData>(() => ({
      url: `${environment.apiBaseUrl}/theory/fretboard`,
      params: { ...query() },
    }));
  }

  /** The diatonic triads of a seven-note scale, derived by the backend rather than looked up. */
  harmony(query: () => HarmonyQuery) {
    return httpResource<HarmonyData>(() => ({
      url: `${environment.apiBaseUrl}/theory/scales/harmonize`,
      params: { ...query() },
    }));
  }

  /** The twelve pitch classes of one octave, spelled under the requested convention. */
  notes(query: () => { readonly spelling: Spelling }) {
    return httpResource<ApiNote[]>(() => ({
      url: `${environment.apiBaseUrl}/theory/notes`,
      params: { ...query() },
    }));
  }

  /**
   * Every chord formula FretLab knows. `enabled` lets a caller that only needs this in one UI mode
   * skip the request entirely the rest of the time, rather than fetching it on every page visit.
   */
  chordTypes(enabled: () => boolean = () => true) {
    return httpResource<ApiChordType[]>(() =>
      enabled() ? `${environment.apiBaseUrl}/theory/chords/types` : undefined,
    );
  }

  /**
   * A chord's tones in root position — inversions are a display-only reordering of this list.
   * Returning `undefined` from `query` (rather than always supplying one) skips the request, the
   * same opt-out `chordTypes` offers.
   */
  chord(query: () => ChordQuery | undefined) {
    return httpResource<ApiChord>(() => {
      const q = query();
      return q && { url: `${environment.apiBaseUrl}/theory/chords`, params: { ...q } };
    });
  }

  /** Every scale formula FretLab knows; see `chordTypes` for the `enabled` opt-out. */
  scaleTypes(enabled: () => boolean = () => true) {
    return httpResource<ApiScaleType[]>(() =>
      enabled() ? `${environment.apiBaseUrl}/theory/scales/types` : undefined,
    );
  }

  /** A scale's tones in ascending order; see `chord` for the `undefined`-to-skip convention. */
  scale(query: () => ScaleQuery | undefined) {
    return httpResource<ApiScale>(() => {
      const q = query();
      return q && { url: `${environment.apiBaseUrl}/theory/scales`, params: { ...q } };
    });
  }
}
