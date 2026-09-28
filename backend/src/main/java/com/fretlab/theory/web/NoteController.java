package com.fretlab.theory.web;

import com.fretlab.theory.interval.Interval;
import com.fretlab.theory.note.Note;
import com.fretlab.theory.note.Spelling;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.stream.IntStream;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Notes are passed as query parameters rather than path segments because a sharp is written
 * {@code #}, which starts the fragment of a URL and would have to be percent-encoded in a path.
 */
@Tag(name = "Theory — notes", description = "Note names, pitch classes and transposition")
@RestController
@RequestMapping("/api/theory/notes")
class NoteController {

    @Operation(summary = "The twelve chromatic notes, written under the requested spelling")
    @GetMapping
    List<NoteResponse> chromatic(@RequestParam(defaultValue = "SHARPS") Spelling spelling) {
        return IntStream.range(0, 12)
                .mapToObj(spelling::spell)
                .map(NoteResponse::from)
                .toList();
    }

    @Operation(summary = "The note a given interval above another, spelled correctly")
    @GetMapping("/transpose")
    TranspositionResponse transpose(@RequestParam String from, @RequestParam String interval) {
        return TranspositionResponse.of(Note.parse(from), Interval.parse(interval));
    }
}
