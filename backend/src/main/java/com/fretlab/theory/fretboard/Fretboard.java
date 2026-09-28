package com.fretlab.theory.fretboard;

import com.fretlab.shared.error.DomainException;
import com.fretlab.shared.error.ErrorCode;
import com.fretlab.theory.note.Pitch;
import java.util.ArrayList;
import java.util.List;

/**
 * A guitar neck: a tuning plus a number of frets.
 *
 * <p>Answers the question everything else is built on — what sounds at a given string and fret.
 * Each fret raises the open string by exactly one semitone, so fret 12 lands an octave up.
 */
public record Fretboard(GuitarTuning tuning, int fretCount) {

    public static final int MAX_FRET_COUNT = 24;

    public Fretboard {
        if (fretCount < 1 || fretCount > MAX_FRET_COUNT) {
            throw new DomainException(ErrorCode.INVALID_FRET_POSITION,
                    "A fretboard must have between 1 and %d frets; got %d."
                            .formatted(MAX_FRET_COUNT, fretCount));
        }
    }

    public static Fretboard standard(int fretCount) {
        return new Fretboard(GuitarTuning.STANDARD, fretCount);
    }

    /** The pitch sounding at this position. */
    public Pitch pitchAt(FretPosition position) {
        if (position.fret() > fretCount) {
            throw new DomainException(ErrorCode.INVALID_FRET_POSITION,
                    "This fretboard has %d frets; got fret %d.".formatted(fretCount, position.fret()));
        }
        return tuning.string(position.stringNumber()).openPitch().up(position.fret());
    }

    public Pitch pitchAt(int stringNumber, int fret) {
        return pitchAt(new FretPosition(stringNumber, fret));
    }

    /** Every playable position, ordered from string 1 outwards and from the nut up. */
    public List<FretPosition> positions() {
        List<FretPosition> all = new ArrayList<>(tuning.stringCount() * (fretCount + 1));
        for (int stringNumber = 1; stringNumber <= tuning.stringCount(); stringNumber++) {
            for (int fret = 0; fret <= fretCount; fret++) {
                all.add(new FretPosition(stringNumber, fret));
            }
        }
        return List.copyOf(all);
    }

    /**
     * Every position sounding the given pitch class — the same note name in all its octaves, which
     * is what "find every C on the neck" means.
     */
    public List<FretPosition> positionsOf(int pitchClass) {
        int target = Math.floorMod(pitchClass, 12);
        return positions().stream()
                .filter(position -> pitchAt(position).pitchClass() == target)
                .toList();
    }
}
