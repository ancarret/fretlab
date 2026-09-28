package com.fretlab.theory.interval;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fretlab.shared.error.DomainException;
import com.fretlab.shared.error.ErrorCode;
import com.fretlab.theory.note.Note;
import java.util.Arrays;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class IntervalTest {

    @ParameterizedTest(name = "{0} up to {1} is {2}")
    @CsvSource({
        "C, E, MAJOR_THIRD",
        "C, G, PERFECT_FIFTH",
        "A, C, MINOR_THIRD",
        "C, C, PERFECT_UNISON",
        "E, F, MINOR_SECOND",
        "B, C, MINOR_SECOND",
        "C, F, PERFECT_FOURTH",
        "F, B, AUGMENTED_FOURTH",
        "B, F, DIMINISHED_FIFTH",
        "C, A, MAJOR_SIXTH",
        "C, Bb, MINOR_SEVENTH",
        "C, B, MAJOR_SEVENTH",
    })
    void identifiesTheIntervalBetweenTwoNotes(String from, String to, Interval expected) {
        assertThat(Interval.between(Note.parse(from), Note.parse(to))).isEqualTo(expected);
    }

    @ParameterizedTest(name = "{1} above {0} is {2}")
    @CsvSource({
        "C, MAJOR_THIRD, E",
        "C, PERFECT_FIFTH, G",
        "A, PERFECT_FIFTH, E",
        "A, MINOR_THIRD, C",
        "D, MAJOR_THIRD, F#",
        "Eb, MAJOR_THIRD, G",
        "Eb, PERFECT_FIFTH, Bb",
        "C, PERFECT_OCTAVE, C",
    })
    void buildsTheNoteAnIntervalAbove(String root, Interval interval, String expected) {
        assertThat(interval.above(Note.parse(root))).isEqualTo(Note.parse(expected));
    }

    /**
     * The case that justifies separating letter from accidental: both spellings sound the same,
     * and only one of them is correct.
     */
    @Test
    void spellsTheSeventhOfGMajorAsFSharpNeverGFlat() {
        Note seventh = Interval.MAJOR_SEVENTH.above(Note.parse("G"));

        assertThat(seventh.name()).isEqualTo("F#");
        assertThat(seventh.isEnharmonicWith(Note.parse("Gb")))
                .as("G flat sounds identical, which is exactly why naming alone is not enough")
                .isTrue();
    }

    @Test
    void spellsGMajorWithASharpAndFMajorWithAFlat() {
        assertThat(majorScaleFrom("G")).containsExactly("G", "A", "B", "C", "D", "E", "F#");
        assertThat(majorScaleFrom("F")).containsExactly("F", "G", "A", "Bb", "C", "D", "E");
        assertThat(majorScaleFrom("C")).containsExactly("C", "D", "E", "F", "G", "A", "B");
    }

    @Test
    void distinguishesIntervalsThatShareASemitoneCount() {
        assertThat(Interval.AUGMENTED_FOURTH.semitones())
                .isEqualTo(Interval.DIMINISHED_FIFTH.semitones());

        assertThat(Interval.AUGMENTED_FOURTH.above(Note.parse("C")).name()).isEqualTo("F#");
        assertThat(Interval.DIMINISHED_FIFTH.above(Note.parse("C")).name()).isEqualTo("Gb");
    }

    @Test
    void everyIntervalIsUniquelyIdentifiedByNumberAndSemitones() {
        long distinctPairs = Arrays.stream(Interval.values())
                .map(interval -> interval.number() + ":" + interval.semitones())
                .distinct()
                .count();

        assertThat(distinctPairs)
                .as("Interval.between relies on this pair being unique")
                .isEqualTo(Interval.values().length);
    }

    @Test
    void parsesBothFullNamesAndShorthand() {
        assertThat(Interval.parse("MAJOR_THIRD")).isEqualTo(Interval.MAJOR_THIRD);
        assertThat(Interval.parse("major_third")).isEqualTo(Interval.MAJOR_THIRD);
        assertThat(Interval.parse("M3")).isEqualTo(Interval.MAJOR_THIRD);
        assertThat(Interval.parse("P5")).isEqualTo(Interval.PERFECT_FIFTH);
    }

    /** Capitalisation is the only thing separating these two shorthands, and they differ by a semitone. */
    @Test
    void treatsShorthandCaseAsMeaningful() {
        assertThat(Interval.parse("M3")).isEqualTo(Interval.MAJOR_THIRD);
        assertThat(Interval.parse("m3")).isEqualTo(Interval.MINOR_THIRD);
        assertThat(Interval.parse("M7")).isEqualTo(Interval.MAJOR_SEVENTH);
        assertThat(Interval.parse("m7")).isEqualTo(Interval.MINOR_SEVENTH);
        assertThat(Interval.parse("A4")).isEqualTo(Interval.AUGMENTED_FOURTH);
        assertThat(Interval.parse("d5")).isEqualTo(Interval.DIMINISHED_FIFTH);
    }

    @Test
    void refusesSpellingsThatWouldNeedATripleAccidental() {
        assertThatThrownBy(() -> Interval.AUGMENTED_FIFTH.above(Note.parse("B#")))
                .isInstanceOf(DomainException.class)
                .extracting(exception -> ((DomainException) exception).code())
                .isEqualTo(ErrorCode.INVALID_ACCIDENTAL);
    }

    @Test
    void rejectsUnknownIntervalNames() {
        assertThatThrownBy(() -> Interval.parse("SUPER_FOURTH"))
                .isInstanceOf(DomainException.class)
                .extracting(exception -> ((DomainException) exception).code())
                .isEqualTo(ErrorCode.INVALID_INTERVAL);
    }

    private static String[] majorScaleFrom(String tonic) {
        Note root = Note.parse(tonic);
        Interval[] steps = {
            Interval.PERFECT_UNISON, Interval.MAJOR_SECOND, Interval.MAJOR_THIRD,
            Interval.PERFECT_FOURTH, Interval.PERFECT_FIFTH, Interval.MAJOR_SIXTH,
            Interval.MAJOR_SEVENTH,
        };
        return Arrays.stream(steps).map(step -> step.above(root).name()).toArray(String[]::new);
    }
}
