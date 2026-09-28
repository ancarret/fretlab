package com.fretlab.theory.chord;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fretlab.shared.error.DomainException;
import com.fretlab.shared.error.ErrorCode;
import com.fretlab.theory.note.Note;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class ChordTest {

    @ParameterizedTest(name = "{0} {1} = {2}")
    @CsvSource({
        "C, MAJOR, 'C, E, G'",
        "A, MINOR, 'A, C, E'",
        "D, MINOR, 'D, F, A'",
        "G, MAJOR, 'G, B, D'",
        "B, DIMINISHED, 'B, D, F'",
        "C, AUGMENTED, 'C, E, G#'",
        "G, DOMINANT_SEVENTH, 'G, B, D, F'",
        "C, MAJOR_SEVENTH_CHORD, 'C, E, G, B'",
        "A, MINOR_SEVENTH_CHORD, 'A, C, E, G'",
    })
    void buildsChordTonesFromRootAndFormula(String root, ChordType type, String expectedCsv) {
        List<Note> expected = List.of(expectedCsv.split(",\\s*")).stream().map(Note::parse).toList();

        assertThat(new Chord(Note.parse(root), type).notes()).isEqualTo(expected);
    }

    @Test
    void rendersTheConventionalSymbol() {
        assertThat(new Chord(Note.parse("A"), ChordType.MINOR).symbol()).isEqualTo("Am");
        assertThat(new Chord(Note.parse("G"), ChordType.DOMINANT_SEVENTH).symbol()).isEqualTo("G7");
        assertThat(new Chord(Note.parse("C"), ChordType.MAJOR).symbol()).isEqualTo("C");
    }

    @ParameterizedTest(name = "{0} identifies as {1}")
    @CsvSource({
        "'A, C, E', Am",
        "'C, E, G', C",
        "'B, D, F', Bdim",
        "'G, B, D, F', G7",
    })
    void identifiesAChordFromItsNotes(String notesCsv, String expectedSymbol) {
        List<Note> notes = List.of(notesCsv.split(",\\s*")).stream().map(Note::parse).toList();

        Optional<Chord> chord = Chord.identify(notes);

        assertThat(chord).isPresent();
        assertThat(chord.get().symbol()).isEqualTo(expectedSymbol);
    }

    @Test
    void findsNoChordForNotesThatDoNotFormOne() {
        List<Note> notes = List.of(Note.parse("C"), Note.parse("C#"), Note.parse("D"));

        assertThat(Chord.identify(notes)).isEmpty();
    }

    /**
     * The symmetric diminished seventh is the case that justifies spelling-aware identification:
     * B D F Ab and D F Ab Cb share every pitch class but are two different chords in writing.
     */
    @Test
    void distinguishesEnharmonicDiminishedSeventhChordsBySpelling() {
        List<Note> speltFromB =
                List.of(Note.parse("B"), Note.parse("D"), Note.parse("F"), Note.parse("Ab"));

        assertThat(Chord.identify(speltFromB)).isPresent();
        assertThat(Chord.identify(speltFromB).get().root()).isEqualTo(Note.parse("B"));
    }

    @ParameterizedTest(name = "''{0}'' is not a chord type")
    @CsvSource({"''", "'MAJESTIC'", "'M'"})
    void rejectsAnUnknownChordType(String text) {
        assertThatThrownBy(() -> ChordType.parse(text))
                .isInstanceOf(DomainException.class)
                .extracting(ex -> ((DomainException) ex).code())
                .isEqualTo(ErrorCode.INVALID_CHORD_TYPE);
    }

    @ParameterizedTest(name = "parses ''{0}'' as {1}")
    @CsvSource({
        "minor_seventh_chord, MINOR_SEVENTH_CHORD",
        "m7, MINOR_SEVENTH_CHORD",
        "dim, DIMINISHED",
    })
    void parsesNameAndSymbol(String text, ChordType expected) {
        assertThat(ChordType.parse(text)).isEqualTo(expected);
    }

    @ParameterizedTest(name = "C major inversion {0} = {1}")
    @CsvSource({
        "0, 'C, E, G'",
        "1, 'E, G, C'",
        "2, 'G, C, E'",
        "3, 'C, E, G'", // Wraps: a triad only has three inversions, so index 3 is root position again.
    })
    void reordersChordTonesForAnInversion(int inversion, String expectedCsv) {
        List<Note> expected = List.of(expectedCsv.split(",\\s*")).stream().map(Note::parse).toList();
        Chord cMajor = new Chord(Note.parse("C"), ChordType.MAJOR);

        assertThat(cMajor.notes(inversion)).isEqualTo(expected);
    }

    @Test
    void aSeventhChordHasAFourthInversion() {
        Chord g7 = new Chord(Note.parse("G"), ChordType.DOMINANT_SEVENTH);

        assertThat(g7.notes(3)).containsExactly(
                Note.parse("F"), Note.parse("G"), Note.parse("B"), Note.parse("D"));
    }

    @ParameterizedTest(name = "inversion {0} is ''{1}''")
    @CsvSource({
        "0, 'Root position'",
        "1, 'First inversion'",
        "2, 'Second inversion'",
    })
    void namesEachInversionOfATriad(int inversion, String expectedName) {
        Chord cMajor = new Chord(Note.parse("C"), ChordType.MAJOR);

        assertThat(cMajor.inversionName(inversion)).isEqualTo(expectedName);
    }

    @Test
    void rejectsAnInversionIndexBeyondTheChordsSize() {
        Chord cMajor = new Chord(Note.parse("C"), ChordType.MAJOR);

        assertThatThrownBy(() -> cMajor.inversionName(3))
                .isInstanceOf(DomainException.class)
                .extracting(ex -> ((DomainException) ex).code())
                .isEqualTo(ErrorCode.INVALID_INVERSION);
    }

    @Test
    void symbolMatchingIsCaseSensitive() {
        // "m" is the minor symbol; "M" must not be folded onto it case-insensitively, or a minor
        // chord could be silently read as major — the same rule applied to interval shorthand.
        assertThat(ChordType.parse("m")).isEqualTo(ChordType.MINOR);
        assertThatThrownBy(() -> ChordType.parse("M"))
                .isInstanceOf(DomainException.class);
    }
}
