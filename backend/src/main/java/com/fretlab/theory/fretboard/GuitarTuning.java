package com.fretlab.theory.fretboard;

import static com.fretlab.theory.note.NoteLetter.A;
import static com.fretlab.theory.note.NoteLetter.B;
import static com.fretlab.theory.note.NoteLetter.D;
import static com.fretlab.theory.note.NoteLetter.E;
import static com.fretlab.theory.note.NoteLetter.G;

import com.fretlab.shared.error.DomainException;
import com.fretlab.shared.error.ErrorCode;
import com.fretlab.theory.note.Note;
import com.fretlab.theory.note.Pitch;
import java.util.ArrayList;
import java.util.List;

/**
 * A set of open string pitches.
 *
 * <p>Only standard tuning exists today. Modelling tuning as a type anyway — rather than hardcoding
 * six pitches inside the fretboard — means drop D or DADGAD later is a new enum constant, not a
 * redesign.
 */
public enum GuitarTuning {

    /** E2 A2 D3 G3 B3 E4, listed from string 1 down to string 6. */
    STANDARD("Standard",
            Pitch.of(Note.natural(E), 4),
            Pitch.of(Note.natural(B), 3),
            Pitch.of(Note.natural(G), 3),
            Pitch.of(Note.natural(D), 3),
            Pitch.of(Note.natural(A), 2),
            Pitch.of(Note.natural(E), 2));

    private final String displayName;
    private final List<GuitarString> strings;

    GuitarTuning(String displayName, Pitch... openPitchesFromFirstString) {
        this.displayName = displayName;
        List<GuitarString> built = new ArrayList<>(openPitchesFromFirstString.length);
        for (int index = 0; index < openPitchesFromFirstString.length; index++) {
            built.add(new GuitarString(index + 1, openPitchesFromFirstString[index]));
        }
        this.strings = List.copyOf(built);
    }

    public String displayName() {
        return displayName;
    }

    public List<GuitarString> strings() {
        return strings;
    }

    public int stringCount() {
        return strings.size();
    }

    public GuitarString string(int number) {
        if (number < 1 || number > strings.size()) {
            throw new DomainException(ErrorCode.INVALID_FRET_POSITION,
                    "%s tuning has strings 1 to %d; got %d."
                            .formatted(displayName, strings.size(), number));
        }
        return strings.get(number - 1);
    }
}
