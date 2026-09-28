package com.fretlab.theory.fretboard;

import com.fretlab.shared.error.DomainException;
import com.fretlab.shared.error.ErrorCode;

/**
 * A coordinate on the neck. String 1 is the thinnest (high E); fret 0 means the open string.
 *
 * <p>Only self-evident bounds are checked here. Whether fret 19 actually exists depends on the
 * instrument, so that check belongs to {@link Fretboard}.
 */
public record FretPosition(int stringNumber, int fret) {

    public FretPosition {
        if (stringNumber < 1) {
            throw new DomainException(ErrorCode.INVALID_FRET_POSITION,
                    "String numbers start at 1; got %d.".formatted(stringNumber));
        }
        if (fret < 0) {
            throw new DomainException(ErrorCode.INVALID_FRET_POSITION,
                    "Fret numbers start at 0 for the open string; got %d.".formatted(fret));
        }
    }

    public boolean isOpen() {
        return fret == 0;
    }
}
