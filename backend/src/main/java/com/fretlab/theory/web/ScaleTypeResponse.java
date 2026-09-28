package com.fretlab.theory.web;

import com.fretlab.theory.scale.ScaleType;

public record ScaleTypeResponse(String id, String displayName, int degreeCount) {

    public static ScaleTypeResponse from(ScaleType type) {
        return new ScaleTypeResponse(type.name(), type.displayName(), type.degreeCount());
    }
}
