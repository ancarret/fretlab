package com.fretlab.learning.practice;

import com.fretlab.theory.interval.Interval;
import com.fretlab.theory.note.Note;
import com.fretlab.theory.note.Spelling;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.IntUnaryOperator;
import java.util.stream.IntStream;

/**
 * Picks a root and an interval for a round of "find the note this interval above the root".
 *
 * <p>The unison and the octave are excluded from the pool: both map to the same pitch class as the
 * root itself (this domain models simple intervals by pitch class, with no octave register), so
 * asking for either would make the target indistinguishable from the root and the exercise trivial.
 */
public final class IntervalChallengeGenerator {

    private static final List<Note> ROOTS =
            IntStream.range(0, 12).mapToObj(Spelling.SHARPS::spell).toList();

    private static final List<Interval> INTERVALS = Arrays.stream(Interval.values())
            .filter(interval -> interval != Interval.PERFECT_UNISON && interval != Interval.PERFECT_OCTAVE)
            .toList();

    private final IntUnaryOperator randomIndex;

    public IntervalChallengeGenerator() {
        this(bound -> ThreadLocalRandom.current().nextInt(bound));
    }

    IntervalChallengeGenerator(IntUnaryOperator randomIndex) {
        this.randomIndex = randomIndex;
    }

    public IntervalChallenge next() {
        Note root = ROOTS.get(randomIndex.applyAsInt(ROOTS.size()));
        Interval interval = INTERVALS.get(randomIndex.applyAsInt(INTERVALS.size()));
        return new IntervalChallenge(root, interval);
    }
}
