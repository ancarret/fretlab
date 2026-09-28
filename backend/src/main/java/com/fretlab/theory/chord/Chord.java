package com.fretlab.theory.chord;

import com.fretlab.shared.error.DomainException;
import com.fretlab.shared.error.ErrorCode;
import com.fretlab.theory.interval.Interval;
import com.fretlab.theory.note.Note;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;

/** A root applied to a {@link ChordType} formula. */
public record Chord(Note root, ChordType type) {

    /** The chord tones in formula order: root, third, fifth, then any seventh. */
    public List<Note> notes() {
        return type.intervals().stream().map(interval -> interval.above(root)).toList();
    }

    /**
     * The chord tones reordered so the note at {@code inversion} steps up from the root becomes the
     * bass — root position at 0, first inversion at 1, and so on, wrapping mod the chord's size so a
     * seventh chord's third inversion is a legal index and a triad's is not silently accepted as
     * something else.
     *
     * <p>This only reorders the note names; it says nothing about which octave each is voiced in on
     * an actual guitar. Real voicings are a fretboard concern, layered on top of this later.
     */
    public List<Note> notes(int inversion) {
        List<Note> rootPosition = notes();
        int offset = Math.floorMod(inversion, rootPosition.size());
        return Stream.concat(
                rootPosition.stream().skip(offset),
                rootPosition.stream().limit(offset))
                .toList();
    }

    /** Conventional symbol, such as {@code Am} or {@code G7}. */
    public String symbol() {
        return root.name() + type.symbol();
    }

    /**
     * The conventional name for an inversion index, such as "Root position" or "First inversion".
     *
     * @throws DomainException if {@code inversion} is not a legal index for this chord's size —
     *         a triad has inversions 0–2, a seventh chord 0–3.
     */
    public String inversionName(int inversion) {
        List<Note> rootPosition = notes();
        if (inversion < 0 || inversion >= rootPosition.size()) {
            throw new DomainException(ErrorCode.INVALID_INVERSION,
                    "%s has no inversion %d; valid range is 0-%d."
                            .formatted(symbol(), inversion, rootPosition.size() - 1));
        }
        return switch (inversion) {
            case 0 -> "Root position";
            case 1 -> "First inversion";
            case 2 -> "Second inversion";
            default -> "Third inversion";
        };
    }

    /**
     * Works out which chord a set of notes spells, if any.
     *
     * <p>Each note is tried as the root in turn: the intervals from it to the others are collected
     * and compared with every formula. Spelling matters here — B D F A♭ is B°7, and D F A♭ C♭ would
     * be D°7, which is how the symmetric diminished seventh still resolves to one answer.
     *
     * <p>{@link Interval#between} only recognises the twelve simple intervals a diatonic chord
     * formula ever needs, and throws on anything else — two notes sharing a letter, such as C and
     * C♯, form an augmented unison, which is not chord vocabulary. A candidate root that hits this
     * is rejected rather than treated as a thrown error: it simply is not one of these notes' root.
     */
    public static Optional<Chord> identify(List<Note> notes) {
        Set<Note> distinct = new HashSet<>(notes);
        for (Note candidateRoot : notes) {
            Set<Interval> intervals = new HashSet<>();
            try {
                for (Note note : distinct) {
                    intervals.add(Interval.between(candidateRoot, note));
                }
            } catch (DomainException ex) {
                continue;
            }
            for (ChordType type : ChordType.values()) {
                if (intervals.equals(new HashSet<>(type.intervals()))) {
                    return Optional.of(new Chord(candidateRoot, type));
                }
            }
        }
        return Optional.empty();
    }
}
