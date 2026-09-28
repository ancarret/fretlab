package com.fretlab.theory.note;

/**
 * A sounding pitch, identified the way MIDI does: a single number where 60 is middle C (C4) and
 * every step is one semitone.
 *
 * <p>A pitch carries no spelling. Fret 2 of the low E string sounds pitch 42 — whether that is
 * written F♯ or G♭ is a separate question that depends on musical context, answered by
 * {@link Spelling}. Keeping the two apart is what stops the fretboard from having to guess.
 *
 * @see Note for the written counterpart
 */
public record Pitch(int midiNumber) {

    public static Pitch of(Note note, int octave) {
        return new Pitch((octave + 1) * 12 + note.pitchClass());
    }

    public int pitchClass() {
        return Math.floorMod(midiNumber, 12);
    }

    /** Scientific pitch notation octave: middle C (MIDI 60) is octave 4. */
    public int octave() {
        return Math.floorDiv(midiNumber, 12) - 1;
    }

    public Pitch up(int semitones) {
        return new Pitch(midiNumber + semitones);
    }

    public Note spell(Spelling spelling) {
        return spelling.spell(pitchClass());
    }
}
