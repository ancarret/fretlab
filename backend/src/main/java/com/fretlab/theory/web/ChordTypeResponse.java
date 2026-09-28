package com.fretlab.theory.web;

import com.fretlab.theory.chord.ChordType;

public record ChordTypeResponse(String id, String displayName, String symbol) {

    public static ChordTypeResponse from(ChordType type) {
        return new ChordTypeResponse(type.name(), type.displayName(), type.symbol());
    }
}
