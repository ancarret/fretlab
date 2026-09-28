package com.fretlab.theory.note;

/**
 * The seven natural note names.
 *
 * <p>Declaration order is significant: stepping through the letters models moving up the musical
 * alphabet, which is what determines an interval's <em>number</em>. The uneven semitone gaps fall
 * out of the pitch classes rather than being special-cased — E to F and B to C are one semitone
 * apart simply because 4→5 and 11→12 are, while every other adjacent pair is two.
 */
public enum NoteLetter {
    C(0),
    D(2),
    E(4),
    F(5),
    G(7),
    A(9),
    B(11);

    private final int naturalPitchClass;

    NoteLetter(int naturalPitchClass) {
        this.naturalPitchClass = naturalPitchClass;
    }

    /** Pitch class of this letter with no accidental applied. */
    public int naturalPitchClass() {
        return naturalPitchClass;
    }

    /** The letter reached by moving {@code steps} places up the alphabet, wrapping past B. */
    public NoteLetter up(int steps) {
        NoteLetter[] letters = values();
        return letters[Math.floorMod(ordinal() + steps, letters.length)];
    }

    /** Places from this letter up to {@code other}, in the range 0–6. */
    public int stepsTo(NoteLetter other) {
        return Math.floorMod(other.ordinal() - ordinal(), values().length);
    }
}
