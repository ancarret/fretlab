package com.fretlab.theory.web;

import com.fretlab.theory.chord.Chord;
import java.util.List;

public record ChordResponse(
        NoteResponse root,
        ChordTypeResponse type,
        String symbol,
        List<NoteResponse> notes,
        int inversion,
        String inversionName) {

    public static ChordResponse from(Chord chord) {
        return from(chord, 0);
    }

    public static ChordResponse from(Chord chord, int inversion) {
        return new ChordResponse(
                NoteResponse.from(chord.root()),
                ChordTypeResponse.from(chord.type()),
                chord.symbol(),
                chord.notes(inversion).stream().map(NoteResponse::from).toList(),
                inversion,
                chord.inversionName(inversion));
    }
}
