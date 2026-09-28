package com.fretlab.theory.web;

import com.fretlab.theory.interval.Interval;
import com.fretlab.theory.note.Note;

public record TranspositionResponse(
        NoteResponse from,
        IntervalResponse interval,
        NoteResponse result) {

    public static TranspositionResponse of(Note from, Interval interval) {
        return new TranspositionResponse(
                NoteResponse.from(from),
                IntervalResponse.from(interval),
                NoteResponse.from(interval.above(from)));
    }
}
