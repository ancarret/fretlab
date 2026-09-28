package com.fretlab.system;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fretlab.shared.config.FretlabProperties;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Web-layer slice: no database, no Testcontainers, so it runs in milliseconds.
 */
@WebMvcTest(HealthController.class)
@EnableConfigurationProperties(FretlabProperties.class)
@TestPropertySource(properties = "fretlab.version=0.0.0-test")
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void reportsUpAndTheRunningBuildVersion() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.version").value("0.0.0-test"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    void unknownEndpointReturnsTheProblemDetailErrorContract() throws Exception {
        mockMvc.perform(get("/api/does-not-exist"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"))
                .andExpect(jsonPath("$.instance").value("/api/does-not-exist"))
                .andExpect(jsonPath("$.timestamp").exists());
    }
}
