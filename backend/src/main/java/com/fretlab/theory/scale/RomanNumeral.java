package com.fretlab.theory.scale;

import com.fretlab.theory.chord.ChordType;
import java.util.Locale;

/**
 * Case and suffix conventions for scale-degree Roman numerals.
 *
 * <p>This is music theory, not formatting: a major triad's degree is written upper-case, a minor
 * triad's lower-case, and a diminished triad additionally carries the {@code °} suffix. Keeping the
 * rule here means {@link Scale#harmonize()} never has to special-case a chord quality by hand.
 */
final class RomanNumeral {

    private static final String[] BASE = {"I", "II", "III", "IV", "V", "VI", "VII"};

    private RomanNumeral() {
    }

    static String of(int degree, ChordType triadQuality) {
        String base = BASE[degree - 1];
        return switch (triadQuality) {
            case MAJOR -> base;
            case MINOR -> base.toLowerCase(Locale.ROOT);
            case DIMINISHED -> base.toLowerCase(Locale.ROOT) + "°";
            case AUGMENTED -> base + "+";
            default -> throw new IllegalStateException(
                    "Roman numeral analysis is only defined for triads, not " + triadQuality);
        };
    }
}
