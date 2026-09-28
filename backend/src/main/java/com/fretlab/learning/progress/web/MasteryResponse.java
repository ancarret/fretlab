package com.fretlab.learning.progress.web;

import com.fretlab.learning.progress.Mastery;

public record MasteryResponse(String exerciseType, int attempts, int correct, int accuracyPercent) {

    public static MasteryResponse from(Mastery mastery) {
        return new MasteryResponse(
                mastery.exerciseType().name(),
                mastery.attempts(),
                mastery.correct(),
                mastery.accuracyPercent());
    }
}
