package com.fretlab.learning.practice;

import static org.assertj.core.api.Assertions.assertThat;

import com.fretlab.theory.interval.Interval;
import com.fretlab.theory.note.Note;
import org.junit.jupiter.api.Test;

class IntervalChallengeGeneratorTest {

    @Test
    void picksTheFirstRootAndIntervalWhenTheGeneratorAlwaysReturnsIndexZero() {
        IntervalChallengeGenerator generator = new IntervalChallengeGenerator(bound -> 0);

        IntervalChallenge challenge = generator.next();

        // Roots are the twelve chromatic notes spelled with sharps, in pitch-class order.
        assertThat(challenge.root()).isEqualTo(Note.parse("C"));
        // Interval.values()[0] is PERFECT_UNISON, which is excluded, so index 0 of the filtered
        // pool is the next declared interval.
        assertThat(challenge.interval()).isEqualTo(Interval.MINOR_SECOND);
    }

    @Test
    void neverOffersTheUnisonOrTheOctave() {
        IntervalChallengeGenerator lowest = new IntervalChallengeGenerator(bound -> 0);
        IntervalChallengeGenerator highest = new IntervalChallengeGenerator(bound -> bound - 1);

        assertThat(lowest.next().interval()).isNotIn(Interval.PERFECT_UNISON, Interval.PERFECT_OCTAVE);
        assertThat(highest.next().interval()).isNotIn(Interval.PERFECT_UNISON, Interval.PERFECT_OCTAVE);
    }

    @Test
    void theTargetIsAlwaysTheIntervalAboveTheRoot() {
        // Index 1 among roots is C#; among the filtered intervals, index 1 is MAJOR_SECOND.
        IntervalChallengeGenerator generator = new IntervalChallengeGenerator(bound -> 1);

        IntervalChallenge challenge = generator.next();

        assertThat(challenge.target()).isEqualTo(challenge.interval().above(challenge.root()));
    }

    @Test
    void neverThrowsWithRealRandomness() {
        IntervalChallengeGenerator generator = new IntervalChallengeGenerator();

        assertThat(generator.next().target()).isNotNull();
    }
}
