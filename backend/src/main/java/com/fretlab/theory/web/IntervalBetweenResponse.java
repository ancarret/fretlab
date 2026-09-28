package com.fretlab.theory.web;

import com.fretlab.theory.interval.Interval;
import com.fretlab.theory.note.Note;

public record IntervalBetweenResponse(
        NoteResponse from,
        NoteResponse to,
        IntervalResponse interval) {

    public static IntervalBetweenResponse of(Note from, Note to) {
        return new IntervalBetweenResponse(
                NoteResponse.from(from),
                NoteResponse.from(to),
                IntervalResponse.from(Interval.between(from, to)));
    }
}
