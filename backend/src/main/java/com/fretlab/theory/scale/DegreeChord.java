package com.fretlab.theory.scale;

import com.fretlab.theory.chord.Chord;

/**
 * One step of diatonic harmony: a scale degree, its conventional Roman numeral, and the triad
 * built on it.
 */
public record DegreeChord(int degree, String romanNumeral, Chord chord) {
}
