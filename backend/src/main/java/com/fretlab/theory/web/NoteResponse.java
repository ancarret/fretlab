package com.fretlab.theory.web;

import com.fretlab.theory.note.Note;

/**
 * A written note.
 *
 * <p>Letter and accidental are sent separately as well as combined so that a client can render
 * "C♯" without parsing the name — deciding where a name ends and an accidental begins is a
 * musical rule, and musical rules stay on this side of the wire.
 */
public record NoteResponse(String name, String letter, String accidental, int pitchClass) {

    public static NoteResponse from(Note note) {
        return new NoteResponse(
                note.name(),
                note.letter().name(),
                note.accidental().symbol(),
                note.pitchClass());
    }
}
