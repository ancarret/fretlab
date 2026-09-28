package com.fretlab.theory.scale;

import static com.fretlab.theory.interval.Interval.MAJOR_SECOND;
import static com.fretlab.theory.interval.Interval.MAJOR_SEVENTH;
import static com.fretlab.theory.interval.Interval.MAJOR_SIXTH;
import static com.fretlab.theory.interval.Interval.MAJOR_THIRD;
import static com.fretlab.theory.interval.Interval.MINOR_SEVENTH;
import static com.fretlab.theory.interval.Interval.MINOR_SIXTH;
import static com.fretlab.theory.interval.Interval.MINOR_THIRD;
import static com.fretlab.theory.interval.Interval.PERFECT_FIFTH;
import static com.fretlab.theory.interval.Interval.PERFECT_FOURTH;
import static com.fretlab.theory.interval.Interval.PERFECT_UNISON;

import com.fretlab.shared.error.DomainException;
import com.fretlab.shared.error.ErrorCode;
import com.fretlab.theory.interval.Interval;
import java.util.List;

/**
 * A scale as a formula of intervals measured from its tonic — the same reasoning as
 * {@link com.fretlab.theory.chord.ChordType}. "G major" is this formula applied to G, not a row
 * anywhere; that is what lets the seventh come out F♯ and never G♭ without a lookup table for
 * every key.
 *
 * <p>The blues scale is deliberately not modelled here: its ♭5/♯4 is a genuinely ambiguous
 * spelling in strict theory terms, and guessing one would put incorrect theory in the domain.
 */
public enum ScaleType {
    MAJOR("Major",
            PERFECT_UNISON, MAJOR_SECOND, MAJOR_THIRD, PERFECT_FOURTH, PERFECT_FIFTH,
            MAJOR_SIXTH, MAJOR_SEVENTH),
    NATURAL_MINOR("Natural minor",
            PERFECT_UNISON, MAJOR_SECOND, MINOR_THIRD, PERFECT_FOURTH, PERFECT_FIFTH,
            MINOR_SIXTH, MINOR_SEVENTH),
    HARMONIC_MINOR("Harmonic minor",
            PERFECT_UNISON, MAJOR_SECOND, MINOR_THIRD, PERFECT_FOURTH, PERFECT_FIFTH,
            MINOR_SIXTH, MAJOR_SEVENTH),
    MELODIC_MINOR("Melodic minor (ascending)",
            PERFECT_UNISON, MAJOR_SECOND, MINOR_THIRD, PERFECT_FOURTH, PERFECT_FIFTH,
            MAJOR_SIXTH, MAJOR_SEVENTH),
    MAJOR_PENTATONIC("Major pentatonic",
            PERFECT_UNISON, MAJOR_SECOND, MAJOR_THIRD, PERFECT_FIFTH, MAJOR_SIXTH),
    MINOR_PENTATONIC("Minor pentatonic",
            PERFECT_UNISON, MINOR_THIRD, PERFECT_FOURTH, PERFECT_FIFTH, MINOR_SEVENTH);

    private final String displayName;
    private final List<Interval> intervals;

    ScaleType(String displayName, Interval... intervals) {
        this.displayName = displayName;
        this.intervals = List.of(intervals);
    }

    public String displayName() {
        return displayName;
    }

    public List<Interval> intervals() {
        return intervals;
    }

    /** How many notes this scale has before repeating the tonic an octave up. */
    public int degreeCount() {
        return intervals.size();
    }

    public static ScaleType parse(String text) {
        if (text == null || text.isBlank()) {
            throw new DomainException(ErrorCode.INVALID_SCALE_TYPE, "A scale type is required.");
        }
        String trimmed = text.trim();
        for (ScaleType type : values()) {
            if (type.name().equalsIgnoreCase(trimmed)) {
                return type;
            }
        }
        throw new DomainException(ErrorCode.INVALID_SCALE_TYPE,
                "'%s' is not a known scale type.".formatted(trimmed));
    }
}
