package com.fretlab;

import static org.hamcrest.Matchers.matchesPattern;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

/**
 * Exercises the real Spring Security filter chain and a real PostgreSQL account, rather than
 * mocking the pieces security actually depends on — a slice test could assert the controller
 * returns the right thing, but only this proves a request without a token is actually rejected
 * before it gets there.
 */
@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
class AuthIntegrationTest {

    // Constructed directly rather than autowired: this project has no Spring-managed ObjectMapper
    // bean (JSON conversion runs through the web starter's own converter), but parsing this test's
    // flat, timestamp-free response body needs no special modules anyway.
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private MockMvc mockMvc;

    @Test
    void registrationLoginAndTheProfileEndpointWorkEndToEnd() throws Exception {
        String email = "andres@example.com";
        String body = """
                {"email": "%s", "password": "correct horse battery staple"}
                """.formatted(email);

        mockMvc.perform(post("/api/auth/register").contentType(APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.token").value(matchesPattern("^[\\w-]+\\.[\\w-]+\\.[\\w-]+$")));

        MvcResult loginResult = mockMvc
                .perform(post("/api/auth/login").contentType(APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andReturn();

        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .get("token").asText();

        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email));
    }

    @Test
    void registeringTheSameEmailTwiceIsRejected() throws Exception {
        String body = """
                {"email": "duplicate@example.com", "password": "correct horse battery staple"}
                """;

        mockMvc.perform(post("/api/auth/register").contentType(APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/register").contentType(APPLICATION_JSON).content(body))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("EMAIL_ALREADY_REGISTERED"));
    }

    @Test
    void loginWithTheWrongPasswordIsRejected() throws Exception {
        mockMvc.perform(post("/api/auth/register").contentType(APPLICATION_JSON).content("""
                {"email": "wrongpass@example.com", "password": "correct horse battery staple"}
                """)).andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/login").contentType(APPLICATION_JSON).content("""
                {"email": "wrongpass@example.com", "password": "not the right password"}
                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
    }

    @Test
    void accessingTheProfileEndpointWithoutATokenIsRejected() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));
    }

    @Test
    void accessingTheProfileEndpointWithAGarbageTokenIsRejected() throws Exception {
        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer not-a-real-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void theoryAndPracticeEndpointsStayPublic() throws Exception {
        mockMvc.perform(get("/api/theory/notes")).andExpect(status().isOk());
        mockMvc.perform(get("/api/practice/fretboard/challenge")).andExpect(status().isOk());
    }

    /**
     * A regression test for a real bug: adding Spring Security moved request handling in front of
     * Spring MVC's own CORS support, so a browser's CORS preflight to a <em>protected</em> endpoint
     * hit {@code anyRequest().authenticated()} before CORS was ever considered and was rejected —
     * invisible to every other test here because MockMvc's plain {@code get()}/{@code post()} calls
     * do not carry an {@code Origin} header and so never exercise CORS at all.
     */
    @Test
    void corsPreflightToAProtectedEndpointSucceedsWithoutAuthentication() throws Exception {
        mockMvc.perform(options("/api/progress/summary")
                        .header("Origin", "http://localhost:4200")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:4200"));
    }
}
