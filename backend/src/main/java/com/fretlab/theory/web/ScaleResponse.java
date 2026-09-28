package com.fretlab.theory.web;

import com.fretlab.theory.scale.Scale;
import java.util.List;

public record ScaleResponse(NoteResponse tonic, ScaleTypeResponse type, List<NoteResponse> notes) {

    public static ScaleResponse from(Scale scale) {
        return new ScaleResponse(
                NoteResponse.from(scale.tonic()),
                ScaleTypeResponse.from(scale.type()),
                scale.notes().stream().map(NoteResponse::from).toList());
    }
}
