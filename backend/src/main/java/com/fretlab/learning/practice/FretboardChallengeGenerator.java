package com.fretlab.learning.practice;

import com.fretlab.theory.note.Note;
import com.fretlab.theory.note.NoteLetter;
import com.fretlab.theory.note.Spelling;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.IntUnaryOperator;
import java.util.stream.IntStream;

/**
 * Picks the target note for a round of the fretboard trainer.
 *
 * <p>Levels 1–3 draw only from the seven natural notes; levels 4–5 draw from all twelve chromatic
 * pitch classes, spelled with sharps. Randomness is injected as an {@link IntUnaryOperator} rather
 * than called directly, so a test can pass a fixed index and assert on a known-correct target
 * instead of a randomly chosen one.
 */
public final class FretboardChallengeGenerator {

    private static final List<Note> NATURAL_NOTES =
            Arrays.stream(NoteLetter.values()).map(Note::natural).toList();

    private static final List<Note> CHROMATIC_NOTES =
            IntStream.range(0, 12).mapToObj(Spelling.SHARPS::spell).toList();

    private final IntUnaryOperator randomIndex;

    public FretboardChallengeGenerator() {
        this(bound -> ThreadLocalRandom.current().nextInt(bound));
    }

    FretboardChallengeGenerator(IntUnaryOperator randomIndex) {
        this.randomIndex = randomIndex;
    }

    public FretboardChallenge next(Difficulty difficulty) {
        List<Note> pool = difficulty.includesAccidentals() ? CHROMATIC_NOTES : NATURAL_NOTES;
        Note target = pool.get(randomIndex.applyAsInt(pool.size()));
        return new FretboardChallenge(difficulty, target);
    }
}
