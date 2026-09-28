package com.fretlab.theory.scale;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fretlab.shared.error.DomainException;
import com.fretlab.shared.error.ErrorCode;
import com.fretlab.theory.chord.Chord;
import com.fretlab.theory.note.Note;
import java.util.List;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class ScaleTest {

    @ParameterizedTest(name = "{0} {1} = {2}")
    @CsvSource({
        "C, MAJOR, 'C, D, E, F, G, A, B'",
        "G, MAJOR, 'G, A, B, C, D, E, F#'",
        "A, NATURAL_MINOR, 'A, B, C, D, E, F, G'",
        "A, HARMONIC_MINOR, 'A, B, C, D, E, F, G#'",
        "A, MELODIC_MINOR, 'A, B, C, D, E, F#, G#'",
        "C, MAJOR_PENTATONIC, 'C, D, E, G, A'",
        "A, MINOR_PENTATONIC, 'A, C, D, E, G'",
    })
    void buildsScaleTonesFromTonicAndFormula(String tonic, ScaleType type, String expectedCsv) {
        List<Note> expected = List.of(expectedCsv.split(",\\s*")).stream().map(Note::parse).toList();

        assertThat(new Scale(Note.parse(tonic), type).notes()).isEqualTo(expected);
    }

    /** The case that justifies keeping written spelling separate from pitch class. */
    @Test
    void gMajorEndsWithFSharpNeverGFlat() {
        Note seventh = new Scale(Note.parse("G"), ScaleType.MAJOR).notes().get(6);

        assertThat(seventh.name()).isEqualTo("F#");
    }

    @Test
    void harmonicMinorRaisesTheSeventhDegree() {
        Note seventh = new Scale(Note.parse("A"), ScaleType.HARMONIC_MINOR).notes().get(6);

        assertThat(seventh.name()).isEqualTo("G#");
    }

    /**
     * The killer demo from the master prompt: C major's diatonic triads, derived from the scale
     * tones rather than looked up, come out C · Dm · Em · F · G · Am · Bdim.
     */
    @Test
    void harmonizesCMajorIntoTheClassicSevenTriads() {
        List<Chord> triads = new Scale(Note.parse("C"), ScaleType.MAJOR).triads();

        List<String> symbols = triads.stream().map(Chord::symbol).toList();

        assertThat(symbols).containsExactly("C", "Dm", "Em", "F", "G", "Am", "Bdim");
    }

    @Test
    void harmonizeAttachesTheConventionalRomanNumerals() {
        List<DegreeChord> harmony = new Scale(Note.parse("C"), ScaleType.MAJOR).harmonize();

        List<String> numerals = harmony.stream().map(DegreeChord::romanNumeral).toList();

        assertThat(numerals).containsExactly("I", "ii", "iii", "IV", "V", "vi", "vii°");
    }

    @Test
    void harmonizesNaturalMinorWithLowerCaseTonicAndRaisedSeventhDiminished() {
        List<String> numerals = new Scale(Note.parse("A"), ScaleType.NATURAL_MINOR).harmonize()
                .stream().map(DegreeChord::romanNumeral)
                .collect(Collectors.toList());

        assertThat(numerals).containsExactly("i", "ii°", "III", "iv", "v", "VI", "VII");
    }

    @Test
    void pentatonicScalesHaveNoDiatonicTriads() {
        Scale pentatonic = new Scale(Note.parse("A"), ScaleType.MINOR_PENTATONIC);

        assertThatThrownBy(pentatonic::triads)
                .isInstanceOf(DomainException.class)
                .extracting(ex -> ((DomainException) ex).code())
                .isEqualTo(ErrorCode.INVALID_SCALE_TYPE);
    }

    @ParameterizedTest(name = "''{0}'' is not a scale type")
    @CsvSource({"''", "'MAJESTIC'"})
    void rejectsAnUnknownScaleType(String text) {
        assertThatThrownBy(() -> ScaleType.parse(text))
                .isInstanceOf(DomainException.class)
                .extracting(ex -> ((DomainException) ex).code())
                .isEqualTo(ErrorCode.INVALID_SCALE_TYPE);
    }

    @Test
    void parsesScaleTypeNamesCaseInsensitively() {
        assertThat(ScaleType.parse("major")).isEqualTo(ScaleType.MAJOR);
        assertThat(ScaleType.parse("Natural_Minor")).isEqualTo(ScaleType.NATURAL_MINOR);
    }
}
