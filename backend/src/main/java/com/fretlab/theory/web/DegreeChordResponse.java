package com.fretlab.theory.web;

import com.fretlab.theory.scale.DegreeChord;

public record DegreeChordResponse(int degree, String romanNumeral, ChordResponse chord) {

    public static DegreeChordResponse from(DegreeChord degreeChord) {
        return new DegreeChordResponse(
                degreeChord.degree(),
                degreeChord.romanNumeral(),
                ChordResponse.from(degreeChord.chord()));
    }
}
