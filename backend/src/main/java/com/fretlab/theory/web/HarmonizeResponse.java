package com.fretlab.theory.web;

import com.fretlab.theory.scale.Scale;
import java.util.List;

public record HarmonizeResponse(NoteResponse tonic, ScaleTypeResponse type, List<DegreeChordResponse> degrees) {

    public static HarmonizeResponse from(Scale scale) {
        return new HarmonizeResponse(
                NoteResponse.from(scale.tonic()),
                ScaleTypeResponse.from(scale.type()),
                scale.harmonize().stream().map(DegreeChordResponse::from).toList());
    }
}
