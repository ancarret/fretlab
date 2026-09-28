package com.fretlab.learning.practice.web;

import com.fretlab.learning.practice.Difficulty;
import com.fretlab.learning.practice.FretboardChallengeGenerator;
import com.fretlab.learning.practice.IntervalChallengeGenerator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Where a target note lives on the neck is public theory, already served at
 * {@code /api/theory/fretboard/positions}. These endpoints only supply what the theory module
 * cannot: which note (or interval) to ask about, and which strings and accidentals are fair game
 * at each level. The client is trusted to grade itself against theory data it fetches separately —
 * there is no exercise state to protect here, only a Duolingo-style practice round.
 */
@Tag(name = "Practice", description = "Backend-generated fretboard and interval practice rounds")
@RestController
@RequestMapping("/api/practice")
class PracticeChallengeController {

    private final FretboardChallengeGenerator noteGenerator = new FretboardChallengeGenerator();
    private final IntervalChallengeGenerator intervalGenerator = new IntervalChallengeGenerator();

    @Operation(summary = "A new target note to find on the neck, at the requested difficulty")
    @GetMapping("/fretboard/challenge")
    FretboardChallengeResponse fretboardChallenge(@RequestParam(defaultValue = "LEVEL_1") Difficulty level) {
        return FretboardChallengeResponse.from(noteGenerator.next(level));
    }

    @Operation(summary = "A root and an interval: find every occurrence of the resulting note")
    @GetMapping("/intervals/challenge")
    IntervalChallengeResponse intervalChallenge() {
        return IntervalChallengeResponse.from(intervalGenerator.next());
    }
}
