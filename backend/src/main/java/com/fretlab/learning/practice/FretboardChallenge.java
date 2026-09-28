package com.fretlab.learning.practice;

import com.fretlab.theory.note.Note;

/**
 * One round of the "find the note" trainer: a target note at a given difficulty.
 *
 * <p>This deliberately does not carry the answer positions. Where the target sounds on the neck is
 * derived from {@link com.fretlab.theory.fretboard.Fretboard}, which the client already has access
 * to — repeating that computation here would be a second, divergent source of truth for the same
 * fact the theory module already owns.
 */
public record FretboardChallenge(Difficulty difficulty, Note target) {
}
