package com.fretlab.theory.web;

import com.fretlab.theory.interval.Interval;
import com.fretlab.theory.note.Note;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Arrays;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Theory — intervals", description = "Interval catalogue and identification")
@RestController
@RequestMapping("/api/theory/intervals")
class IntervalController {

    @Operation(summary = "Every simple interval, with its number, quality and semitone distance")
    @GetMapping
    List<IntervalResponse> all() {
        return Arrays.stream(Interval.values()).map(IntervalResponse::from).toList();
    }

    @Operation(summary = "The interval between two notes, always within one octave")
    @GetMapping("/between")
    IntervalBetweenResponse between(@RequestParam String from, @RequestParam String to) {
        return IntervalBetweenResponse.of(Note.parse(from), Note.parse(to));
    }
}
