package com.fretlab.theory.web;

import com.fretlab.shared.error.DomainException;
import com.fretlab.shared.error.ErrorCode;
import com.fretlab.theory.chord.Chord;
import com.fretlab.theory.chord.ChordType;
import com.fretlab.theory.note.Note;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Arrays;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Theory — chords", description = "Chord construction and identification")
@RestController
@RequestMapping("/api/theory/chords")
class ChordController {

    @Operation(summary = "Every known chord formula")
    @GetMapping("/types")
    List<ChordTypeResponse> types() {
        return Arrays.stream(ChordType.values()).map(ChordTypeResponse::from).toList();
    }

    @Operation(summary = "The notes of a chord built from a root and a formula, in the given inversion")
    @GetMapping
    ChordResponse build(
            @RequestParam String root,
            @RequestParam String type,
            @RequestParam(defaultValue = "0") int inversion) {
        return ChordResponse.from(new Chord(Note.parse(root), ChordType.parse(type)), inversion);
    }

    @Operation(summary = "Which chord a set of notes spells, if any")
    @GetMapping("/identify")
    ChordResponse identify(@RequestParam List<String> notes) {
        List<Note> parsed = notes.stream().map(Note::parse).toList();
        return Chord.identify(parsed)
                .map(ChordResponse::from)
                .orElseThrow(() -> new DomainException(ErrorCode.INVALID_CHORD_TYPE,
                        "%s does not spell any known chord.".formatted(parsed)));
    }
}
