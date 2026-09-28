package com.fretlab.theory.note;

import static com.fretlab.theory.note.Accidental.FLAT;
import static com.fretlab.theory.note.Accidental.NATURAL;
import static com.fretlab.theory.note.Accidental.SHARP;
import static com.fretlab.theory.note.NoteLetter.A;
import static com.fretlab.theory.note.NoteLetter.B;
import static com.fretlab.theory.note.NoteLetter.C;
import static com.fretlab.theory.note.NoteLetter.D;
import static com.fretlab.theory.note.NoteLetter.E;
import static com.fretlab.theory.note.NoteLetter.F;
import static com.fretlab.theory.note.NoteLetter.G;

/**
 * How to write a pitch that has no key context — on a bare fretboard, for instance.
 *
 * <p>Five of the twelve pitch classes have no natural spelling and must be written as either a
 * sharp or a flat. Neither choice is more correct in isolation: sharp keys spell that pitch F♯ and
 * flat keys spell it G♭. This enum is therefore a <em>default</em>, not an authority. Once a key is
 * known, the key decides, and this is no longer consulted.
 */
public enum Spelling {
    SHARPS,
    FLATS;

    private static final Note[] AS_SHARPS = {
        new Note(C, NATURAL), new Note(C, SHARP), new Note(D, NATURAL), new Note(D, SHARP),
        new Note(E, NATURAL), new Note(F, NATURAL), new Note(F, SHARP), new Note(G, NATURAL),
        new Note(G, SHARP), new Note(A, NATURAL), new Note(A, SHARP), new Note(B, NATURAL),
    };

    private static final Note[] AS_FLATS = {
        new Note(C, NATURAL), new Note(D, FLAT), new Note(D, NATURAL), new Note(E, FLAT),
        new Note(E, NATURAL), new Note(F, NATURAL), new Note(G, FLAT), new Note(G, NATURAL),
        new Note(A, FLAT), new Note(A, NATURAL), new Note(B, FLAT), new Note(B, NATURAL),
    };

    public Note spell(int pitchClass) {
        int index = Math.floorMod(pitchClass, 12);
        return this == SHARPS ? AS_SHARPS[index] : AS_FLATS[index];
    }
}
