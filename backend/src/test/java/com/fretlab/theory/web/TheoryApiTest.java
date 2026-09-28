package com.fretlab.theory.web;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Web-layer contract for the theory module. The musical rules themselves are covered by the domain
 * unit tests; what is checked here is that they reach HTTP intact.
 */
@WebMvcTest({
    NoteController.class, IntervalController.class, FretboardController.class,
    ChordController.class, ScaleController.class
})
class TheoryApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void listsTheTwelveChromaticNotesUsingSharpsByDefault() throws Exception {
        mockMvc.perform(get("/api/theory/notes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(12))
                .andExpect(jsonPath("$[0].name").value("C"))
                .andExpect(jsonPath("$[1].name").value("C#"))
                .andExpect(jsonPath("$[1].letter").value("C"))
                .andExpect(jsonPath("$[1].accidental").value("#"))
                .andExpect(jsonPath("$[1].pitchClass").value(1));
    }

    @Test
    void spellsTheSameNotesWithFlatsWhenAsked() throws Exception {
        mockMvc.perform(get("/api/theory/notes").param("spelling", "FLATS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[1].name").value("Db"))
                .andExpect(jsonPath("$[1].pitchClass").value(1));
    }

    @Test
    void transposesWithCorrectSpelling() throws Exception {
        mockMvc.perform(get("/api/theory/notes/transpose")
                        .param("from", "G")
                        .param("interval", "MAJOR_SEVENTH"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.from.name").value("G"))
                .andExpect(jsonPath("$.result.name").value("F#"))
                .andExpect(jsonPath("$.interval.shorthand").value("M7"));
    }

    @Test
    void identifiesTheIntervalBetweenTwoNotes() throws Exception {
        mockMvc.perform(get("/api/theory/intervals/between").param("from", "C").param("to", "E"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.interval.id").value("MAJOR_THIRD"))
                .andExpect(jsonPath("$.interval.semitones").value(4))
                .andExpect(jsonPath("$.interval.number").value(3))
                .andExpect(jsonPath("$.interval.quality").value("MAJOR"));
    }

    @Test
    void listsEveryInterval() throws Exception {
        mockMvc.perform(get("/api/theory/intervals"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].shorthand", hasItem("P5")))
                .andExpect(jsonPath("$[*].shorthand", hasItem("m3")))
                .andExpect(jsonPath("$[*].shorthand", hasItem("M3")));
    }

    @Test
    void returnsTheWholeNeckWithTheNoteAtEachPosition() throws Exception {
        mockMvc.perform(get("/api/theory/fretboard").param("frets", "12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fretCount").value(12))
                .andExpect(jsonPath("$.tuning.id").value("STANDARD"))
                .andExpect(jsonPath("$.tuning.strings.length()").value(6))
                .andExpect(jsonPath("$.positions.length()").value(6 * 13))
                .andExpect(jsonPath("$.positions[?(@.string==5 && @.fret==3)].note.name",
                        contains("C")))
                .andExpect(jsonPath("$.positions[?(@.string==6 && @.fret==0)].note.name",
                        contains("E")))
                .andExpect(jsonPath("$.positions[?(@.string==6 && @.fret==0)].octave",
                        contains(2)));
    }

    @Test
    void findsEveryOccurrenceOfANote() throws Exception {
        mockMvc.perform(get("/api/theory/fretboard/positions").param("note", "C"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.note.name").value("C"))
                .andExpect(jsonPath("$.positions.length()").value(6));
    }

    @Test
    void echoesBackTheSpellingTheCallerAskedFor() throws Exception {
        mockMvc.perform(get("/api/theory/fretboard/positions").param("note", "Db"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.note.name").value("Db"))
                .andExpect(jsonPath("$.note.pitchClass").value(1));
    }

    @Test
    void reportsAnUnknownNoteAsABadRequestWithADomainCode() throws Exception {
        mockMvc.perform(get("/api/theory/fretboard/positions").param("note", "H"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_NOTE"))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.instance").value("/api/theory/fretboard/positions"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    void reportsAFretBeyondTheNeckAsABadRequest() throws Exception {
        mockMvc.perform(get("/api/theory/fretboard").param("frets", "40"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_FRET_POSITION"));
    }

    @Test
    void reportsAMissingParameterAsABadRequest() throws Exception {
        mockMvc.perform(get("/api/theory/intervals/between").param("from", "C"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("REQUEST_NOT_VALID"));
    }

    @Test
    void buildsAChordFromRootAndType() throws Exception {
        mockMvc.perform(get("/api/theory/chords").param("root", "A").param("type", "MINOR"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.symbol").value("Am"))
                .andExpect(jsonPath("$.notes[*].name", contains("A", "C", "E")))
                .andExpect(jsonPath("$.inversion").value(0))
                .andExpect(jsonPath("$.inversionName").value("Root position"));
    }

    @Test
    void buildsAChordInversion() throws Exception {
        mockMvc.perform(get("/api/theory/chords")
                        .param("root", "C").param("type", "MAJOR").param("inversion", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notes[*].name", contains("E", "G", "C")))
                .andExpect(jsonPath("$.inversionName").value("First inversion"));
    }

    @Test
    void reportsAnOutOfRangeInversionAsABadRequest() throws Exception {
        mockMvc.perform(get("/api/theory/chords")
                        .param("root", "C").param("type", "MAJOR").param("inversion", "5"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INVERSION"));
    }

    @Test
    void identifiesAChordFromItsNotes() throws Exception {
        mockMvc.perform(get("/api/theory/chords/identify").param("notes", "A,C,E"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.symbol").value("Am"))
                .andExpect(jsonPath("$.root.name").value("A"));
    }

    @Test
    void reportsNotesThatDoNotSpellAChordAsABadRequest() throws Exception {
        mockMvc.perform(get("/api/theory/chords/identify").param("notes", "C,C#,D"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_CHORD_TYPE"));
    }

    @Test
    void buildsGMajorScaleWithTheCorrectSpelling() throws Exception {
        mockMvc.perform(get("/api/theory/scales").param("tonic", "G").param("type", "MAJOR"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notes.length()").value(7))
                .andExpect(jsonPath("$.notes[6].name").value("F#"));
    }

    @Test
    void harmonizesCMajorIntoTheClassicSevenChords() throws Exception {
        mockMvc.perform(get("/api/theory/scales/harmonize")
                        .param("tonic", "C").param("type", "MAJOR"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.degrees.length()").value(7))
                .andExpect(jsonPath("$.degrees[0].romanNumeral").value("I"))
                .andExpect(jsonPath("$.degrees[0].chord.symbol").value("C"))
                .andExpect(jsonPath("$.degrees[6].romanNumeral").value("vii°"))
                .andExpect(jsonPath("$.degrees[6].chord.symbol").value("Bdim"));
    }

    @Test
    void reportsHarmonizingAPentatonicScaleAsABadRequest() throws Exception {
        mockMvc.perform(get("/api/theory/scales/harmonize")
                        .param("tonic", "A").param("type", "MINOR_PENTATONIC"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_SCALE_TYPE"));
    }
}
