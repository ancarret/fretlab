package com.fretlab.theory.note;

import com.fretlab.shared.error.DomainException;
import com.fretlab.shared.error.ErrorCode;
import java.util.Locale;

/**
 * A <em>written</em> note: a letter plus an accidental.
 *
 * <p>This is deliberately not the same thing as a pitch. C♯ and D♭ sound identical and share a
 * pitch class, yet they are different notes, and which one is correct depends on context — the
 * seventh of G major is F♯ and never G♭, because a G major scale must use each letter exactly
 * once. Collapsing both into a single twelve-value enum would make that distinction unrepresentable
 * and quietly produce wrong scale and chord spellings later.
 *
 * @see Pitch for the sounding counterpart
 */
public record Note(NoteLetter letter, Accidental accidental) {

    public static Note natural(NoteLetter letter) {
        return new Note(letter, Accidental.NATURAL);
    }

    /** Parses names such as {@code C}, {@code F#}, {@code Bb} or {@code Fx}-style doubles ({@code F##}). */
    public static Note parse(String text) {
        if (text == null || text.isBlank()) {
            throw new DomainException(ErrorCode.INVALID_NOTE, "A note name is required.");
        }
        String trimmed = text.trim();
        String letterPart = trimmed.substring(0, 1).toUpperCase(Locale.ROOT);

        NoteLetter noteLetter;
        try {
            noteLetter = NoteLetter.valueOf(letterPart);
        } catch (IllegalArgumentException ex) {
            throw new DomainException(ErrorCode.INVALID_NOTE,
                    "'%s' is not a note name. Note letters run from A to G.".formatted(trimmed));
        }

        return new Note(noteLetter, Accidental.parseSymbol(trimmed.substring(1)));
    }

    /** Which of the twelve chromatic pitch classes this note sounds as, 0 = C. */
    public int pitchClass() {
        return Math.floorMod(letter.naturalPitchClass() + accidental.semitoneOffset(), 12);
    }

    /** True when both notes sound the same despite being written differently, as with C♯ and D♭. */
    public boolean isEnharmonicWith(Note other) {
        return pitchClass() == other.pitchClass();
    }

    public String name() {
        return letter.name() + accidental.symbol();
    }

    @Override
    public String toString() {
        return name();
    }
}
