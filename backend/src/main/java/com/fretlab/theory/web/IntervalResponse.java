package com.fretlab.theory.web;

import com.fretlab.theory.interval.Interval;

public record IntervalResponse(
        String id,
        String name,
        String shorthand,
        int number,
        String quality,
        int semitones) {

    public static IntervalResponse from(Interval interval) {
        return new IntervalResponse(
                interval.name(),
                interval.displayName(),
                interval.shorthand(),
                interval.number(),
                interval.quality().name(),
                interval.semitones());
    }
}
