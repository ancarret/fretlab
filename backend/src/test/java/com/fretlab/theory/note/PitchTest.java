package com.fretlab.theory.note;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class PitchTest {

    @ParameterizedTest(name = "{0}{1} is MIDI {2}")
    @CsvSource({
        "C, 4, 60",   // middle C, the anchor of the whole numbering
        "E, 2, 40",   // low E string
        "A, 2, 45",
        "D, 3, 50",
        "G, 3, 55",
        "B, 3, 59",
        "E, 4, 64",   // high E string
    })
    void numbersPitchesTheWayMidiDoes(String letter, int octave, int expectedMidi) {
        Pitch pitch = Pitch.of(Note.natural(NoteLetter.valueOf(letter)), octave);

        assertThat(pitch.midiNumber()).isEqualTo(expectedMidi);
        assertThat(pitch.octave()).isEqualTo(octave);
    }

    @Test
    void twelveSemitonesUpIsTheSameNoteAnOctaveHigher() {
        Pitch lowE = Pitch.of(Note.natural(NoteLetter.E), 2);
        Pitch octaveUp = lowE.up(12);

        assertThat(octaveUp.pitchClass()).isEqualTo(lowE.pitchClass());
        assertThat(octaveUp.octave()).isEqualTo(3);
    }

    @Test
    void spellingDecidesHowAnAmbiguousPitchIsWritten() {
        Pitch pitch = Pitch.of(Note.natural(NoteLetter.F), 3).up(1);

        assertThat(pitch.spell(Spelling.SHARPS).name()).isEqualTo("F#");
        assertThat(pitch.spell(Spelling.FLATS).name()).isEqualTo("Gb");
    }

    @Test
    void naturalPitchesAreWrittenTheSameUnderEitherSpelling() {
        Pitch middleC = Pitch.of(Note.natural(NoteLetter.C), 4);

        assertThat(middleC.spell(Spelling.SHARPS)).isEqualTo(middleC.spell(Spelling.FLATS));
    }
}
