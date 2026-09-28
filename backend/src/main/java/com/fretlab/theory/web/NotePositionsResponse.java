package com.fretlab.theory.web;

import com.fretlab.theory.fretboard.Fretboard;
import com.fretlab.theory.note.Note;
import java.util.List;

/**
 * Where a note occurs across the neck — the data behind "find every C".
 *
 * <p>Matching is by pitch class, so asking for C♯ and asking for D♭ return the same positions.
 * The note echoed back is the one that was asked for, keeping the caller's spelling intact.
 */
public record NotePositionsResponse(NoteResponse note, int fretCount, List<Position> positions) {

    public record Position(int string, int fret, int octave) {
    }

    public static NotePositionsResponse from(Fretboard fretboard, Note note) {
        List<Position> positions = fretboard.positionsOf(note.pitchClass()).stream()
                .map(position -> new Position(
                        position.stringNumber(),
                        position.fret(),
                        fretboard.pitchAt(position).octave()))
                .toList();

        return new NotePositionsResponse(NoteResponse.from(note), fretboard.fretCount(), positions);
    }
}
