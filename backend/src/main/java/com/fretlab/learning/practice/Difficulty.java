package com.fretlab.learning.practice;

import java.util.Set;

/**
 * The five progressive levels of the fretboard note trainer.
 *
 * <p>Each level widens the search space along one axis at a time — first which strings are in
 * play, then whether accidentals appear, then whether the clock is running — so a learner is never
 * asked to juggle more than one new difficulty at once.
 */
public enum Difficulty {
    LEVEL_1(Set.of(5, 6), false, false),
    LEVEL_2(Set.of(4, 5, 6), false, false),
    LEVEL_3(Set.of(1, 2, 3, 4, 5, 6), false, false),
    LEVEL_4(Set.of(1, 2, 3, 4, 5, 6), true, false),
    LEVEL_5(Set.of(1, 2, 3, 4, 5, 6), true, true);

    private final Set<Integer> strings;
    private final boolean includesAccidentals;
    private final boolean timed;

    Difficulty(Set<Integer> strings, boolean includesAccidentals, boolean timed) {
        this.strings = strings;
        this.includesAccidentals = includesAccidentals;
        this.timed = timed;
    }

    /** String numbers in play at this level; string 6 is the low E, string 1 the high E. */
    public Set<Integer> strings() {
        return strings;
    }

    /** Whether the target note can be one of the five pitch classes with no natural name. */
    public boolean includesAccidentals() {
        return includesAccidentals;
    }

    public boolean timed() {
        return timed;
    }
}
