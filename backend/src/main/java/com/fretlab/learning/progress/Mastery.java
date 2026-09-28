package com.fretlab.learning.progress;

import java.util.Arrays;
import java.util.List;

/**
 * Accuracy for one exercise type, derived from a list of attempts rather than tracked as a running
 * total — the mastery algorithm the master prompt asks not to fake sophistication in starts as
 * "correct divided by attempted" and can grow more sophisticated later without touching storage.
 */
public record Mastery(ExerciseType exerciseType, int attempts, int correct) {

    public int accuracyPercent() {
        return attempts == 0 ? 0 : Math.round(100f * correct / attempts);
    }

    /** One entry per {@link ExerciseType}, in declaration order, even for types with zero attempts. */
    public static List<Mastery> summarize(List<Attempt> attempts) {
        return Arrays.stream(ExerciseType.values())
                .map(type -> {
                    long total = attempts.stream().filter(a -> a.exerciseType() == type).count();
                    long correct = attempts.stream()
                            .filter(a -> a.exerciseType() == type && a.correct())
                            .count();
                    return new Mastery(type, (int) total, (int) correct);
                })
                .toList();
    }
}
