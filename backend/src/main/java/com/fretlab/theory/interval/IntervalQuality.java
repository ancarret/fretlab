package com.fretlab.theory.interval;

/**
 * Whether an interval is perfect, major/minor, or altered.
 *
 * <p>Unisons, fourths, fifths and octaves are perfect and are never major or minor; seconds,
 * thirds, sixths and sevenths are major or minor and are never perfect. Both families can be
 * augmented or diminished.
 */
public enum IntervalQuality {
    DIMINISHED,
    MINOR,
    PERFECT,
    MAJOR,
    AUGMENTED
}
