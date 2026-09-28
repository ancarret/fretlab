package com.fretlab.theory.web;

import com.fretlab.theory.fretboard.FretPosition;
import com.fretlab.theory.fretboard.Fretboard;
import com.fretlab.theory.fretboard.GuitarTuning;
import com.fretlab.theory.note.Pitch;
import com.fretlab.theory.note.Spelling;
import java.util.List;

/**
 * Every position on a neck, with the note sounding at each.
 *
 * <p>Sent in one response rather than per position: a 24-fret neck is 150 entries, small enough
 * that one request beats 150, and it lets the client redraw the whole board from a single payload.
 */
public record FretboardResponse(
        Tuning tuning,
        int fretCount,
        String spelling,
        List<Position> positions) {

    public record Tuning(String id, String name, List<TuningString> strings) {
    }

    public record TuningString(int number, NoteResponse openNote, int octave) {
    }

    public record Position(int string, int fret, NoteResponse note, int octave) {
    }

    public static FretboardResponse from(Fretboard fretboard, Spelling spelling) {
        List<Position> positions = fretboard.positions().stream()
                .map(position -> toPosition(fretboard, position, spelling))
                .toList();

        return new FretboardResponse(
                toTuning(fretboard.tuning(), spelling),
                fretboard.fretCount(),
                spelling.name(),
                positions);
    }

    private static Position toPosition(Fretboard fretboard, FretPosition position,
            Spelling spelling) {
        Pitch pitch = fretboard.pitchAt(position);
        return new Position(
                position.stringNumber(),
                position.fret(),
                NoteResponse.from(pitch.spell(spelling)),
                pitch.octave());
    }

    private static Tuning toTuning(GuitarTuning tuning, Spelling spelling) {
        List<TuningString> strings = tuning.strings().stream()
                .map(string -> new TuningString(
                        string.number(),
                        NoteResponse.from(string.openPitch().spell(spelling)),
                        string.openPitch().octave()))
                .toList();

        return new Tuning(tuning.name(), tuning.displayName(), strings);
    }
}
