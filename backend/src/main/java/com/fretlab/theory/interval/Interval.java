package com.fretlab.theory.interval;

import static com.fretlab.theory.interval.IntervalQuality.AUGMENTED;
import static com.fretlab.theory.interval.IntervalQuality.DIMINISHED;
import static com.fretlab.theory.interval.IntervalQuality.MAJOR;
import static com.fretlab.theory.interval.IntervalQuality.MINOR;
import static com.fretlab.theory.interval.IntervalQuality.PERFECT;

import com.fretlab.shared.error.DomainException;
import com.fretlab.shared.error.ErrorCode;
import com.fretlab.theory.note.Accidental;
import com.fretlab.theory.note.Note;
import com.fretlab.theory.note.NoteLetter;

/**
 * A simple interval — the distance between two notes within one octave.
 *
 * <p>An interval is two facts, not one. Its <em>number</em> counts letter names (C up to E is a
 * third because C, D, E is three letters) and its <em>quality</em> fixes the exact semitone
 * distance. Both are needed: an augmented fourth and a diminished fifth are both six semitones and
 * are not the same interval, because one is written F while the other is written G♭, and they
 * resolve in opposite directions.
 */
public enum Interval {
    PERFECT_UNISON(1, PERFECT, 0, "P1", "Perfect unison"),
    MINOR_SECOND(2, MINOR, 1, "m2", "Minor second"),
    MAJOR_SECOND(2, MAJOR, 2, "M2", "Major second"),
    MINOR_THIRD(3, MINOR, 3, "m3", "Minor third"),
    MAJOR_THIRD(3, MAJOR, 4, "M3", "Major third"),
    PERFECT_FOURTH(4, PERFECT, 5, "P4", "Perfect fourth"),
    AUGMENTED_FOURTH(4, AUGMENTED, 6, "A4", "Augmented fourth"),
    DIMINISHED_FIFTH(5, DIMINISHED, 6, "d5", "Diminished fifth"),
    PERFECT_FIFTH(5, PERFECT, 7, "P5", "Perfect fifth"),
    AUGMENTED_FIFTH(5, AUGMENTED, 8, "A5", "Augmented fifth"),
    MINOR_SIXTH(6, MINOR, 8, "m6", "Minor sixth"),
    MAJOR_SIXTH(6, MAJOR, 9, "M6", "Major sixth"),
    DIMINISHED_SEVENTH(7, DIMINISHED, 9, "d7", "Diminished seventh"),
    MINOR_SEVENTH(7, MINOR, 10, "m7", "Minor seventh"),
    MAJOR_SEVENTH(7, MAJOR, 11, "M7", "Major seventh"),
    PERFECT_OCTAVE(8, PERFECT, 12, "P8", "Perfect octave");

    private final int number;
    private final IntervalQuality quality;
    private final int semitones;
    private final String shorthand;
    private final String displayName;

    Interval(int number, IntervalQuality quality, int semitones, String shorthand,
            String displayName) {
        this.number = number;
        this.quality = quality;
        this.semitones = semitones;
        this.shorthand = shorthand;
        this.displayName = displayName;
    }

    /** Letter-name distance, counting both endpoints: a third is 3. */
    public int number() {
        return number;
    }

    public IntervalQuality quality() {
        return quality;
    }

    public int semitones() {
        return semitones;
    }

    /** Compact form used on fretboard labels, such as {@code m3} or {@code P5}. */
    public String shorthand() {
        return shorthand;
    }

    public String displayName() {
        return displayName;
    }

    /**
     * The note this interval above {@code note}, spelled correctly.
     *
     * <p>The letter is chosen first, from the interval's number — a third above C is always some
     * kind of E. Only then is the accidental derived, as whatever is needed to reach the required
     * semitone distance. Doing it in that order is what makes the seventh of G major come out as
     * F♯ rather than the enharmonically identical but wrong G♭.
     */
    public Note above(Note note) {
        NoteLetter targetLetter = note.letter().up(number - 1);
        int targetPitchClass = Math.floorMod(note.pitchClass() + semitones, 12);

        // Normalised to [-6, 5] so the nearest spelling wins rather than an 11-semitone detour.
        int offset =
                Math.floorMod(targetPitchClass - targetLetter.naturalPitchClass() + 6, 12) - 6;

        return new Note(targetLetter, Accidental.ofOffset(offset));
    }

    /**
     * The interval from {@code from} up to {@code to}.
     *
     * <p>Always a simple interval: given note names alone there is no octave information, so C up
     * to C is reported as a unison rather than an octave.
     */
    public static Interval between(Note from, Note to) {
        int targetNumber = from.letter().stepsTo(to.letter()) + 1;
        int targetSemitones = Math.floorMod(to.pitchClass() - from.pitchClass(), 12);

        for (Interval interval : values()) {
            if (interval.number == targetNumber && interval.semitones == targetSemitones) {
                return interval;
            }
        }
        throw new DomainException(ErrorCode.INVALID_INTERVAL,
                "%s up to %s is not a recognised simple interval.".formatted(from.name(), to.name()));
    }

    /**
     * Accepts a full name such as {@code MAJOR_THIRD}, or a shorthand such as {@code M3}.
     *
     * <p>Shorthand is matched <strong>case-sensitively</strong> and deliberately so: capitalisation
     * is what carries the quality. {@code M3} is a major third and {@code m3} a minor third, one
     * semitone apart. Full names have no such ambiguity, so those are matched case-insensitively.
     */
    public static Interval parse(String text) {
        if (text == null || text.isBlank()) {
            throw new DomainException(ErrorCode.INVALID_INTERVAL, "An interval is required.");
        }
        String trimmed = text.trim();
        for (Interval interval : values()) {
            if (interval.name().equalsIgnoreCase(trimmed) || interval.shorthand.equals(trimmed)) {
                return interval;
            }
        }
        throw new DomainException(ErrorCode.INVALID_INTERVAL,
                "'%s' is not a known interval. Use a name such as MAJOR_THIRD or a shorthand such as M3."
                        .formatted(trimmed));
    }
}
