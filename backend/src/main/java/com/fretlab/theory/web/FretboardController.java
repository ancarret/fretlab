package com.fretlab.theory.web;

import com.fretlab.theory.fretboard.Fretboard;
import com.fretlab.theory.fretboard.GuitarTuning;
import com.fretlab.theory.note.Note;
import com.fretlab.theory.note.Spelling;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Theory — fretboard", description = "What sounds where on the neck")
@RestController
@RequestMapping("/api/theory/fretboard")
class FretboardController {

    @Operation(summary = "Every position on the neck with the note sounding at it")
    @GetMapping
    FretboardResponse fretboard(
            @RequestParam(defaultValue = "STANDARD") GuitarTuning tuning,
            @RequestParam(defaultValue = "12") int frets,
            @RequestParam(defaultValue = "SHARPS") Spelling spelling) {

        return FretboardResponse.from(new Fretboard(tuning, frets), spelling);
    }

    @Operation(summary = "Every position of one note across the neck, matched by pitch class")
    @GetMapping("/positions")
    NotePositionsResponse positionsOf(
            @RequestParam String note,
            @RequestParam(defaultValue = "STANDARD") GuitarTuning tuning,
            @RequestParam(defaultValue = "12") int frets) {

        return NotePositionsResponse.from(new Fretboard(tuning, frets), Note.parse(note));
    }
}
