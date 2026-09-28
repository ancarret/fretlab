package com.fretlab.theory.fretboard;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.tuple;

import com.fretlab.shared.error.DomainException;
import com.fretlab.shared.error.ErrorCode;
import com.fretlab.theory.note.Note;
import com.fretlab.theory.note.Spelling;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class FretboardTest {

    private final Fretboard fretboard = Fretboard.standard(12);

    @ParameterizedTest(name = "string {0}, fret {1} sounds {2}")
    @CsvSource({
        "6, 0, E",   // low E, open
        "6, 1, F",   // one semitone up, and E to F is a semitone
        "6, 3, G",
        "6, 5, A",
        "6, 12, E",  // the octave
        "5, 0, A",
        "5, 3, C",
        "4, 0, D",
        "3, 0, G",
        "2, 0, B",
        "2, 1, C",   // B to C is a semitone too
        "1, 0, E",
    })
    void namesTheNoteAtAPosition(int string, int fret, String expected) {
        Note sounding = fretboard.pitchAt(string, fret).spell(Spelling.SHARPS);

        assertThat(sounding.name()).isEqualTo(expected);
    }

    @Test
    void twelfthFretIsAnOctaveAboveTheOpenString() {
        var open = fretboard.pitchAt(6, 0);
        var twelfth = fretboard.pitchAt(6, 12);

        assertThat(twelfth.midiNumber() - open.midiNumber()).isEqualTo(12);
        assertThat(twelfth.octave()).isEqualTo(open.octave() + 1);
    }

    @Test
    void findsEveryPositionOfANoteAcrossTheNeck() {
        int cPitchClass = Note.parse("C").pitchClass();

        assertThat(fretboard.positionsOf(cPitchClass))
                .extracting(FretPosition::stringNumber, FretPosition::fret)
                .containsExactlyInAnyOrder(
                        tuple(1, 8), tuple(2, 1), tuple(3, 5),
                        tuple(4, 10), tuple(5, 3), tuple(6, 8));
    }

    @Test
    void enharmonicNotesShareTheSamePositions() {
        assertThat(fretboard.positionsOf(Note.parse("C#").pitchClass()))
                .isEqualTo(fretboard.positionsOf(Note.parse("Db").pitchClass()));
    }

    @Test
    void coversEveryStringAndFretIncludingOpenStrings() {
        assertThat(fretboard.positions()).hasSize(6 * 13);
    }

    @Test
    void rejectsAFretBeyondTheEndOfTheNeck() {
        assertThatThrownBy(() -> fretboard.pitchAt(6, 13))
                .isInstanceOf(DomainException.class)
                .extracting(exception -> ((DomainException) exception).code())
                .isEqualTo(ErrorCode.INVALID_FRET_POSITION);
    }

    @Test
    void rejectsAStringTheTuningDoesNotHave() {
        assertThatThrownBy(() -> fretboard.pitchAt(7, 0))
                .isInstanceOf(DomainException.class)
                .extracting(exception -> ((DomainException) exception).code())
                .isEqualTo(ErrorCode.INVALID_FRET_POSITION);
    }

    @Test
    void rejectsAnImpossibleNeck() {
        assertThatThrownBy(() -> Fretboard.standard(30))
                .isInstanceOf(DomainException.class);
    }

    @Test
    void standardTuningIsEADGBEFromTheSixthString() {
        assertThat(GuitarTuning.STANDARD.strings())
                .extracting(string -> string.openPitch().spell(Spelling.SHARPS).name()
                        + string.openPitch().octave())
                .containsExactly("E4", "B3", "G3", "D3", "A2", "E2");
    }
}
