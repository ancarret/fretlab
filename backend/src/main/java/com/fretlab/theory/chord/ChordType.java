package com.fretlab.theory.chord;

import static com.fretlab.theory.interval.Interval.AUGMENTED_FIFTH;
import static com.fretlab.theory.interval.Interval.DIMINISHED_FIFTH;
import static com.fretlab.theory.interval.Interval.DIMINISHED_SEVENTH;
import static com.fretlab.theory.interval.Interval.MAJOR_SECOND;
import static com.fretlab.theory.interval.Interval.MAJOR_SEVENTH;
import static com.fretlab.theory.interval.Interval.MAJOR_THIRD;
import static com.fretlab.theory.interval.Interval.MINOR_SEVENTH;
import static com.fretlab.theory.interval.Interval.MINOR_THIRD;
import static com.fretlab.theory.interval.Interval.PERFECT_FIFTH;
import static com.fretlab.theory.interval.Interval.PERFECT_FOURTH;
import static com.fretlab.theory.interval.Interval.PERFECT_UNISON;

import com.fretlab.shared.error.DomainException;
import com.fretlab.shared.error.ErrorCode;
import com.fretlab.theory.interval.Interval;
import java.util.List;

/**
 * A chord as a formula of intervals measured from its root.
 *
 * <p>This is the whole reason there is no chord table in the database. "C major" is not a stored
 * fact; it is this formula applied to C. One row per chord per key would be thousands of rows
 * encoding what these few lines already say, and could still never answer a question the seed data
 * did not anticipate.
 */
public enum ChordType {
    MAJOR("Major", "", PERFECT_UNISON, MAJOR_THIRD, PERFECT_FIFTH),
    MINOR("Minor", "m", PERFECT_UNISON, MINOR_THIRD, PERFECT_FIFTH),
    DIMINISHED("Diminished", "dim", PERFECT_UNISON, MINOR_THIRD, DIMINISHED_FIFTH),
    AUGMENTED("Augmented", "aug", PERFECT_UNISON, MAJOR_THIRD, AUGMENTED_FIFTH),
    SUSPENDED_SECOND("Suspended 2nd", "sus2", PERFECT_UNISON, MAJOR_SECOND, PERFECT_FIFTH),
    SUSPENDED_FOURTH("Suspended 4th", "sus4", PERFECT_UNISON, PERFECT_FOURTH, PERFECT_FIFTH),
    DOMINANT_SEVENTH("Dominant 7th", "7",
            PERFECT_UNISON, MAJOR_THIRD, PERFECT_FIFTH, MINOR_SEVENTH),
    MAJOR_SEVENTH_CHORD("Major 7th", "maj7",
            PERFECT_UNISON, MAJOR_THIRD, PERFECT_FIFTH, MAJOR_SEVENTH),
    MINOR_SEVENTH_CHORD("Minor 7th", "m7",
            PERFECT_UNISON, MINOR_THIRD, PERFECT_FIFTH, MINOR_SEVENTH),
    HALF_DIMINISHED_SEVENTH("Half-diminished 7th", "m7b5",
            PERFECT_UNISON, MINOR_THIRD, DIMINISHED_FIFTH, MINOR_SEVENTH),
    DIMINISHED_SEVENTH_CHORD("Diminished 7th", "dim7",
            PERFECT_UNISON, MINOR_THIRD, DIMINISHED_FIFTH, DIMINISHED_SEVENTH);

    private final String displayName;
    private final String symbol;
    private final List<Interval> intervals;

    ChordType(String displayName, String symbol, Interval... intervals) {
        this.displayName = displayName;
        this.symbol = symbol;
        this.intervals = List.of(intervals);
    }

    public String displayName() {
        return displayName;
    }

    /** Suffix appended to the root to form the chord symbol, as the {@code m} in {@code Am}. */
    public String symbol() {
        return symbol;
    }

    public List<Interval> intervals() {
        return intervals;
    }

    /**
     * Accepts a name such as {@code MINOR_SEVENTH_CHORD} or a symbol such as {@code m7}.
     *
     * <p>Symbols are matched case-sensitively, for the same reason interval shorthand is: chord
     * notation uses capitalisation to carry meaning, and quietly folding {@code M} into {@code m}
     * would turn a major chord into a minor one.
     */
    public static ChordType parse(String text) {
        if (text == null || text.isBlank()) {
            throw new DomainException(ErrorCode.INVALID_CHORD_TYPE, "A chord type is required.");
        }
        String trimmed = text.trim();
        for (ChordType type : values()) {
            if (type.name().equalsIgnoreCase(trimmed)
                    || (!type.symbol.isEmpty() && type.symbol.equals(trimmed))) {
                return type;
            }
        }
        throw new DomainException(ErrorCode.INVALID_CHORD_TYPE,
                "'%s' is not a known chord type.".formatted(trimmed));
    }
}
