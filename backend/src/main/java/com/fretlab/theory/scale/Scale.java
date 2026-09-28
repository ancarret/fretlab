package com.fretlab.theory.scale;

import com.fretlab.shared.error.DomainException;
import com.fretlab.shared.error.ErrorCode;
import com.fretlab.theory.chord.Chord;
import com.fretlab.theory.note.Note;
import java.util.List;
import java.util.stream.IntStream;

/** A tonic applied to a {@link ScaleType} formula. */
public record Scale(Note tonic, ScaleType type) {

    /** The scale tones in ascending order, tonic first, not repeating the tonic at the octave. */
    public List<Note> notes() {
        return type.intervals().stream().map(interval -> interval.above(tonic)).toList();
    }

    /**
     * Diatonic triads, one per degree, each built by stacking thirds within the scale — degrees
     * i, i+2 and i+4 of the scale itself, not of the chromatic scale.
     *
     * <p>Only meaningful for seven-note scales: "every other scale tone" only lands a third away
     * when there are seven degrees to skip across. A five-note pentatonic scale has no degree III
     * or degree VII to build on, so asking it for triads is a usage error rather than something to
     * silently approximate.
     */
    public List<Chord> triads() {
        List<Note> notes = notes();
        int degreeCount = notes.size();
        if (degreeCount != 7) {
            throw new DomainException(ErrorCode.INVALID_SCALE_TYPE,
                    "Diatonic harmony needs a seven-note scale; %s has %d."
                            .formatted(type.displayName(), degreeCount));
        }

        return IntStream.range(0, degreeCount)
                .mapToObj(i -> {
                    Note root = notes.get(i);
                    Note third = notes.get((i + 2) % degreeCount);
                    Note fifth = notes.get((i + 4) % degreeCount);
                    return Chord.identify(List.of(root, third, fifth))
                            .orElseThrow(() -> new IllegalStateException(
                                    "Degree %d of %s %s did not spell a known triad."
                                            .formatted(i + 1, tonic, type)));
                })
                .toList();
    }

    /** The full diatonic harmony of this scale, e.g. C major's {@code I ii iii IV V vi vii°}. */
    public List<DegreeChord> harmonize() {
        List<Chord> triads = triads();
        return IntStream.rangeClosed(1, triads.size())
                .mapToObj(degree -> {
                    Chord chord = triads.get(degree - 1);
                    return new DegreeChord(degree, RomanNumeral.of(degree, chord.type()), chord);
                })
                .toList();
    }
}
