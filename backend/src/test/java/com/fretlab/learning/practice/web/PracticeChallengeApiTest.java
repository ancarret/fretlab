package com.fretlab.learning.practice.web;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Web-layer contract only. Which note is asked for is random by design, so these tests check the
 * shape and the difficulty rules rather than a specific target.
 */
@WebMvcTest(PracticeChallengeController.class)
class PracticeChallengeApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void defaultsToLevelOneWithStringsFiveAndSixOnly() throws Exception {
        mockMvc.perform(get("/api/practice/fretboard/challenge"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.level").value("LEVEL_1"))
                .andExpect(jsonPath("$.eligibleStrings.length()").value(2))
                .andExpect(jsonPath("$.eligibleStrings", everyItem(greaterThanOrEqualTo(5))))
                .andExpect(jsonPath("$.includesAccidentals").value(false))
                .andExpect(jsonPath("$.timed").value(false))
                .andExpect(jsonPath("$.target.name").exists());
    }

    @Test
    void levelThreeOpensUpAllSixStrings() throws Exception {
        mockMvc.perform(get("/api/practice/fretboard/challenge").param("level", "LEVEL_3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eligibleStrings.length()").value(6));
    }

    @Test
    void levelFiveIsTimedAndIncludesAccidentals() throws Exception {
        mockMvc.perform(get("/api/practice/fretboard/challenge").param("level", "LEVEL_5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.includesAccidentals").value(true))
                .andExpect(jsonPath("$.timed").value(true));
    }

    @Test
    void reportsAnUnknownLevelAsABadRequest() throws Exception {
        mockMvc.perform(get("/api/practice/fretboard/challenge").param("level", "LEVEL_99"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("REQUEST_NOT_VALID"));
    }

    @Test
    void intervalChallengeIncludesRootIntervalAndTarget() throws Exception {
        mockMvc.perform(get("/api/practice/intervals/challenge"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.root.name").exists())
                .andExpect(jsonPath("$.interval.shorthand").exists())
                .andExpect(jsonPath("$.target.name").exists());
    }
}
