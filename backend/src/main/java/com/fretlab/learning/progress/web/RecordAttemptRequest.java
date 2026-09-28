package com.fretlab.learning.progress.web;

import com.fretlab.learning.progress.ExerciseType;
import jakarta.validation.constraints.NotNull;

public record RecordAttemptRequest(@NotNull ExerciseType exerciseType, boolean correct) {
}
