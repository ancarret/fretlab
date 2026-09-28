package com.fretlab.learning.practice.web;

import com.fretlab.learning.practice.FretboardChallenge;
import com.fretlab.theory.web.NoteResponse;
import java.util.List;

public record FretboardChallengeResponse(
        String level,
        NoteResponse target,
        List<Integer> eligibleStrings,
        boolean includesAccidentals,
        boolean timed) {

    public static FretboardChallengeResponse from(FretboardChallenge challenge) {
        return new FretboardChallengeResponse(
                challenge.difficulty().name(),
                NoteResponse.from(challenge.target()),
                challenge.difficulty().strings().stream().sorted().toList(),
                challenge.difficulty().includesAccidentals(),
                challenge.difficulty().timed());
    }
}
