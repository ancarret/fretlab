import { NoteRole } from './fretboard/fretboard';

/**
 * The scale degree each formula step lands on, by scale type. The API returns scale tones as a
 * flat, ordered list of notes with no degree attached, so this small, fixed table is what lets any
 * fretboard or piano colour a scale's root/third/fifth/seventh consistently everywhere — every
 * `ScaleType` formula in the backend is reproduced here only as a step count, never as a theory
 * decision like which accidental a step needs.
 */
export const SCALE_DEGREE_NUMBERS: Record<string, readonly number[]> = {
  MAJOR: [1, 2, 3, 4, 5, 6, 7],
  NATURAL_MINOR: [1, 2, 3, 4, 5, 6, 7],
  HARMONIC_MINOR: [1, 2, 3, 4, 5, 6, 7],
  MELODIC_MINOR: [1, 2, 3, 4, 5, 6, 7],
  MAJOR_PENTATONIC: [1, 2, 3, 5, 6],
  MINOR_PENTATONIC: [1, 3, 4, 5, 7],
};

/**
 * Which role a chord tone plays, by its position in the root-position formula.
 *
 * <p>Index 2 is always some kind of fifth and index 3 (when present) always some kind of seventh
 * across every formula in {@code ChordType}. Index 1 is a third for every triad except the two
 * suspended chords, which replace it with a second or a fourth — genuinely a different degree, so
 * it is drawn as "other" rather than mislabelled as a third.
 */
export function roleForChordDegree(degree: number, chordTypeId: string): NoteRole {
  if (degree === 0) return 'root';
  if (degree === 1) {
    const suspended = chordTypeId === 'SUSPENDED_SECOND' || chordTypeId === 'SUSPENDED_FOURTH';
    return suspended ? 'other' : 'third';
  }
  if (degree === 2) return 'fifth';
  return 'seventh';
}

export function roleForScaleDegree(degreeNumber: number): NoteRole {
  if (degreeNumber === 1) return 'root';
  if (degreeNumber === 3) return 'third';
  if (degreeNumber === 5) return 'fifth';
  if (degreeNumber === 7) return 'seventh';
  return 'other';
}

/** Mirrors an interval's own number, so a major third and a minor third both read as "third". */
export function roleForIntervalNumber(number: number): NoteRole {
  if (number === 3) return 'third';
  if (number === 5) return 'fifth';
  if (number === 7) return 'seventh';
  return 'other';
}
