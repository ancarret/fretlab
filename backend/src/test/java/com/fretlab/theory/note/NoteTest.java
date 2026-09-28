package com.fretlab.theory.note;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fretlab.shared.error.DomainException;
import com.fretlab.shared.error.ErrorCode;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class NoteTest {

    @ParameterizedTest(name = "{0} is pitch class {1}")
    @CsvSource({
        "C, 0", "D, 2", "E, 4", "F, 5", "G, 7", "A, 9", "B, 11",
        "C#, 1", "Db, 1", "F#, 6", "Gb, 6", "Bb, 10", "A#, 10",
    })
    void mapsWrittenNotesOntoTheTwelvePitchClasses(String name, int expectedPitchClass) {
        assertThat(Note.parse(name).pitchClass()).isEqualTo(expectedPitchClass);
    }

    @ParameterizedTest(name = "{0} wraps to pitch class {1}")
    @CsvSource({"B#, 0", "Cb, 11", "E#, 5", "Fb, 4", "B##, 1", "Cbb, 10"})
    void wrapsAroundTheOctaveBoundary(String name, int expectedPitchClass) {
        assertThat(Note.parse(name).pitchClass()).isEqualTo(expectedPitchClass);
    }

    @Test
    void treatsSameSoundingNotesAsEnharmonicButNotEqual() {
        Note cSharp = Note.parse("C#");
        Note dFlat = Note.parse("Db");

        assertThat(cSharp.isEnharmonicWith(dFlat)).isTrue();
        assertThat(cSharp).isNotEqualTo(dFlat);
    }

    @Test
    void parsesCaseInsensitively() {
        assertThat(Note.parse("bb")).isEqualTo(Note.parse("Bb"));
    }

    @Test
    void rejectsLettersOutsideTheMusicalAlphabet() {
        assertThatThrownBy(() -> Note.parse("H"))
                .isInstanceOf(DomainException.class)
                .extracting(exception -> ((DomainException) exception).code())
                .isEqualTo(ErrorCode.INVALID_NOTE);
    }

    @Test
    void rejectsUnknownAccidentals() {
        assertThatThrownBy(() -> Note.parse("C$"))
                .isInstanceOf(DomainException.class)
                .extracting(exception -> ((DomainException) exception).code())
                .isEqualTo(ErrorCode.INVALID_ACCIDENTAL);
    }

    @Test
    void rendersNamesUsingAsciiAccidentals() {
        assertThat(Note.parse("F#").name()).isEqualTo("F#");
        assertThat(Note.parse("Bb").name()).isEqualTo("Bb");
        assertThat(Note.natural(NoteLetter.G).name()).isEqualTo("G");
    }
}
