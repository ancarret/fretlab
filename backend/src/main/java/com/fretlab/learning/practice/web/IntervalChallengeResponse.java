package com.fretlab.learning.practice.web;

import com.fretlab.learning.practice.IntervalChallenge;
import com.fretlab.theory.web.IntervalResponse;
import com.fretlab.theory.web.NoteResponse;

public record IntervalChallengeResponse(NoteResponse root, IntervalResponse interval, NoteResponse target) {

    public static IntervalChallengeResponse from(IntervalChallenge challenge) {
        return new IntervalChallengeResponse(
                NoteResponse.from(challenge.root()),
                IntervalResponse.from(challenge.interval()),
                NoteResponse.from(challenge.target()));
    }
}
