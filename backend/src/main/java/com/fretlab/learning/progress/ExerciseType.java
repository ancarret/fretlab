package com.fretlab.learning.progress;

/**
 * What kind of exercise an attempt was graded on.
 *
 * <p>Only the two exercises that actually exist have a value here — {@code FRETBOARD_NOTE} for the
 * note trainer, {@code INTERVAL} for the interval trainer. Chords, scales and harmony stay absent
 * until their own generators exist; the dashboard's mastery list already marks those topics as
 * placeholder, and adding a type with nothing that can ever produce it would be dead vocabulary.
 */
public enum ExerciseType {
    FRETBOARD_NOTE,
    INTERVAL
}
