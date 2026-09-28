package com.fretlab.theory.web;

import com.fretlab.theory.note.Note;
import com.fretlab.theory.scale.Scale;
import com.fretlab.theory.scale.ScaleType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Arrays;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Theory — scales", description = "Scale construction and diatonic harmony")
@RestController
@RequestMapping("/api/theory/scales")
class ScaleController {

    @Operation(summary = "Every known scale formula")
    @GetMapping("/types")
    List<ScaleTypeResponse> types() {
        return Arrays.stream(ScaleType.values()).map(ScaleTypeResponse::from).toList();
    }

    @Operation(summary = "The notes of a scale built from a tonic and a formula")
    @GetMapping
    ScaleResponse build(@RequestParam String tonic, @RequestParam String type) {
        return ScaleResponse.from(new Scale(Note.parse(tonic), ScaleType.parse(type)));
    }

    @Operation(summary = "The diatonic triads of a seven-note scale, with Roman numerals")
    @GetMapping("/harmonize")
    HarmonizeResponse harmonize(@RequestParam String tonic, @RequestParam String type) {
        return HarmonizeResponse.from(new Scale(Note.parse(tonic), ScaleType.parse(type)));
    }
}
