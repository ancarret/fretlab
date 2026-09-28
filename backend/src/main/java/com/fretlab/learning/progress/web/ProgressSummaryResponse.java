package com.fretlab.learning.progress.web;

import com.fretlab.learning.progress.Attempt;
import com.fretlab.learning.progress.Mastery;
import java.util.List;

public record ProgressSummaryResponse(int totalAttempts, List<MasteryResponse> mastery) {

    public static ProgressSummaryResponse from(List<Attempt> attempts) {
        return new ProgressSummaryResponse(
                attempts.size(),
                Mastery.summarize(attempts).stream().map(MasteryResponse::from).toList());
    }
}
