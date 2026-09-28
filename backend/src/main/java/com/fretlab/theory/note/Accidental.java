package com.fretlab.theory.note;

import com.fretlab.shared.error.DomainException;
import com.fretlab.shared.error.ErrorCode;

/**
 * How far a written note is shifted from its natural letter.
 *
 * <p>Doubles are included because transposition genuinely produces them: the third of a D♯ major
 * triad is F𝄪, not G, and spelling it G would give the chord two Gs and no F.
 */
public enum Accidental {
    DOUBLE_FLAT(-2, "bb"),
    FLAT(-1, "b"),
    NATURAL(0, ""),
    SHARP(1, "#"),
    DOUBLE_SHARP(2, "##");

    private final int semitoneOffset;
    private final String symbol;

    Accidental(int semitoneOffset, String symbol) {
        this.semitoneOffset = semitoneOffset;
        this.symbol = symbol;
    }

    public int semitoneOffset() {
        return semitoneOffset;
    }

    /** ASCII symbol used by the API. Rendering it as ♭ or ♯ is the client's job. */
    public String symbol() {
        return symbol;
    }

    public static Accidental ofOffset(int semitoneOffset) {
        for (Accidental accidental : values()) {
            if (accidental.semitoneOffset == semitoneOffset) {
                return accidental;
            }
        }
        throw new DomainException(ErrorCode.INVALID_ACCIDENTAL,
                "Writing this note correctly would need an accidental of %d semitones; FretLab supports double flat to double sharp."
                        .formatted(semitoneOffset));
    }

    static Accidental parseSymbol(String symbol) {
        for (Accidental accidental : values()) {
            if (accidental.symbol.equals(symbol)) {
                return accidental;
            }
        }
        throw new DomainException(ErrorCode.INVALID_ACCIDENTAL,
                "'%s' is not a valid accidental. Use '#', 'b', '##' or 'bb'.".formatted(symbol));
    }
}
