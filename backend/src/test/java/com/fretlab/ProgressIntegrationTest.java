package com.fretlab;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Registration, a JWT and real attempt rows against a real Postgres — the same reasoning as
 * {@link AuthIntegrationTest}: only the full stack proves the protected endpoint actually rejects
 * an anonymous request and actually attributes attempts to the right account.
 */
@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
class ProgressIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void recordsAttemptsAndSummarisesMasteryForTheSignedInAccount() throws Exception {
        String token = registerAndGetToken("progress-happy@example.com");

        record(token, "FRETBOARD_NOTE", true);
        record(token, "FRETBOARD_NOTE", true);
        record(token, "FRETBOARD_NOTE", false);
        record(token, "INTERVAL", true);

        mockMvc.perform(get("/api/progress/summary").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAttempts").value(4))
                .andExpect(jsonPath("$.mastery[?(@.exerciseType=='FRETBOARD_NOTE')].attempts").value(3))
                .andExpect(jsonPath("$.mastery[?(@.exerciseType=='FRETBOARD_NOTE')].accuracyPercent").value(67))
                .andExpect(jsonPath("$.mastery[?(@.exerciseType=='INTERVAL')].accuracyPercent").value(100));
    }

    @Test
    void aFreshAccountHasNoAttemptsYet() throws Exception {
        String token = registerAndGetToken("progress-fresh@example.com");

        mockMvc.perform(get("/api/progress/summary").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAttempts").value(0));
    }

    @Test
    void recordingAnAttemptWithoutATokenIsRejected() throws Exception {
        mockMvc.perform(post("/api/progress/attempts")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {"exerciseType": "FRETBOARD_NOTE", "correct": true}
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void oneAccountNeverSeesAnothersAttempts() throws Exception {
        String tokenA = registerAndGetToken("progress-a@example.com");
        String tokenB = registerAndGetToken("progress-b@example.com");

        record(tokenA, "FRETBOARD_NOTE", true);
        record(tokenA, "FRETBOARD_NOTE", true);

        mockMvc.perform(get("/api/progress/summary").header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAttempts").value(0));
    }

    private String registerAndGetToken(String email) throws Exception {
        var result = mockMvc.perform(post("/api/auth/register")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {"email": "%s", "password": "correct horse battery staple"}
                                """.formatted(email)))
                .andExpect(status().isCreated())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }

    private void record(String token, String exerciseType, boolean correct) throws Exception {
        mockMvc.perform(post("/api/progress/attempts")
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {"exerciseType": "%s", "correct": %s}
                                """.formatted(exerciseType, correct)))
                .andExpect(status().isCreated());
    }
}
