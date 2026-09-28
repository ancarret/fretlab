package com.fretlab.learning.practice;

import static org.assertj.core.api.Assertions.assertThat;

import com.fretlab.theory.note.Note;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

class FretboardChallengeGeneratorTest {

    @Test
    void picksTheFirstNaturalNoteWhenTheGeneratorAlwaysReturnsIndexZero() {
        FretboardChallengeGenerator generator = new FretboardChallengeGenerator(bound -> 0);

        FretboardChallenge challenge = generator.next(Difficulty.LEVEL_1);

        // NoteLetter's declaration order is C D E F G A B, so index 0 is always C.
        assertThat(challenge.target()).isEqualTo(Note.parse("C"));
        assertThat(challenge.difficulty()).isEqualTo(Difficulty.LEVEL_1);
    }

    @Test
    void picksTheLastNaturalNoteWhenTheGeneratorReturnsTheHighestIndex() {
        FretboardChallengeGenerator generator = new FretboardChallengeGenerator(bound -> bound - 1);

        FretboardChallenge challenge = generator.next(Difficulty.LEVEL_3);

        assertThat(challenge.target()).isEqualTo(Note.parse("B"));
    }

    @ParameterizedTest
    @EnumSource(value = Difficulty.class, names = {"LEVEL_1", "LEVEL_2", "LEVEL_3"})
    void neverOffersAnAccidentalBelowLevelFour(Difficulty difficulty) {
        FretboardChallengeGenerator generator = new FretboardChallengeGenerator(bound -> bound - 1);

        FretboardChallenge challenge = generator.next(difficulty);

        assertThat(challenge.target().accidental().symbol()).isEmpty();
    }

    @Test
    void canOfferAnAccidentalFromLevelFour() {
        // Index 1 in the twelve-note chromatic pool (spelled with sharps) is C#.
        FretboardChallengeGenerator generator = new FretboardChallengeGenerator(bound -> 1);

        FretboardChallenge challenge = generator.next(Difficulty.LEVEL_4);

        assertThat(challenge.target()).isEqualTo(Note.parse("C#"));
    }

    @ParameterizedTest
    @EnumSource(Difficulty.class)
    void everyLevelDrawsFromANonEmptyPool(Difficulty difficulty) {
        FretboardChallengeGenerator generator = new FretboardChallengeGenerator();

        // Exercises the real ThreadLocalRandom path; asserting only that it never throws.
        assertThat(generator.next(difficulty).target()).isNotNull();
    }
}
