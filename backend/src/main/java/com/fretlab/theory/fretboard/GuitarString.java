package com.fretlab.theory.fretboard;

import com.fretlab.theory.note.Pitch;

/** A single string, identified by number and by the pitch it sounds when played open. */
public record GuitarString(int number, Pitch openPitch) {
}
