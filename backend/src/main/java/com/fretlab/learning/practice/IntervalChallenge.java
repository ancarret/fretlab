package com.fretlab.learning.practice;

import com.fretlab.theory.interval.Interval;
import com.fretlab.theory.note.Note;

/**
 * One round of the interval trainer: find the note a given interval above a given root.
 *
 * <p>The target note is included directly rather than left for the client to derive, because it is
 * a one-line call to {@link Interval#above} the generator has already made to pick a sensible
 * challenge — exposing it here saves a redundant round trip without duplicating the calculation
 * anywhere.
 */
public record IntervalChallenge(Note root, Interval interval, Note target) {

    public IntervalChallenge(Note root, Interval interval) {
        this(root, interval, interval.above(root));
    }
}
