package com.fretlab.learning.progress;

import static org.assertj.core.api.Assertions.assertThat;

import com.fretlab.user.User;
import java.util.List;
import org.junit.jupiter.api.Test;

class MasteryTest {

    private final User user = new User("andres@example.com", "irrelevant-hash");

    @Test
    void computesAccuracyAsCorrectOverAttempted() {
        List<Attempt> attempts = List.of(
                new Attempt(user, ExerciseType.FRETBOARD_NOTE, true),
                new Attempt(user, ExerciseType.FRETBOARD_NOTE, true),
                new Attempt(user, ExerciseType.FRETBOARD_NOTE, false));

        List<Mastery> summary = Mastery.summarize(attempts);

        Mastery fretboard = summary.stream()
                .filter(m -> m.exerciseType() == ExerciseType.FRETBOARD_NOTE)
                .findFirst().orElseThrow();
        assertThat(fretboard.attempts()).isEqualTo(3);
        assertThat(fretboard.correct()).isEqualTo(2);
        assertThat(fretboard.accuracyPercent()).isEqualTo(67); // 2/3 rounded, not truncated
    }

    @Test
    void reportsEveryExerciseTypeEvenWithZeroAttempts() {
        List<Mastery> summary = Mastery.summarize(List.of());

        assertThat(summary).hasSize(ExerciseType.values().length);
        assertThat(summary).allSatisfy(m -> {
            assertThat(m.attempts()).isZero();
            assertThat(m.accuracyPercent()).isZero();
        });
    }

    @Test
    void keepsExerciseTypesSeparate() {
        List<Attempt> attempts = List.of(
                new Attempt(user, ExerciseType.FRETBOARD_NOTE, true),
                new Attempt(user, ExerciseType.INTERVAL, false));

        List<Mastery> summary = Mastery.summarize(attempts);

        assertThat(summary)
                .filteredOn(m -> m.exerciseType() == ExerciseType.FRETBOARD_NOTE)
                .extracting(Mastery::accuracyPercent)
                .containsExactly(100);
        assertThat(summary)
                .filteredOn(m -> m.exerciseType() == ExerciseType.INTERVAL)
                .extracting(Mastery::accuracyPercent)
                .containsExactly(0);
    }
}
