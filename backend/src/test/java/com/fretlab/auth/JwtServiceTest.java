package com.fretlab.auth;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

    // 32+ bytes, matching the HMAC-SHA256 key-length requirement real secrets must also satisfy.
    private static final String SECRET = "unit-test-secret-key-with-plenty-of-entropy-behind-it";

    private final JwtService jwtService = new JwtService(SECRET, Duration.ofMinutes(60));

    @Test
    void verifyRecoversTheEmailATokenWasIssuedFor() {
        String token = jwtService.issue("andres@example.com");

        assertThat(jwtService.verify(token)).contains("andres@example.com");
    }

    @Test
    void rejectsATokenSignedWithADifferentSecret() {
        JwtService other = new JwtService("a-completely-different-secret-key-of-similar-length", Duration.ofMinutes(60));
        String token = other.issue("andres@example.com");

        assertThat(jwtService.verify(token)).isEmpty();
    }

    @Test
    void rejectsAnExpiredToken() {
        JwtService expiring = new JwtService(SECRET, Duration.ofMillis(1));
        String token = expiring.issue("andres@example.com");

        await(50);

        assertThat(jwtService.verify(token)).isEmpty();
    }

    @Test
    void rejectsGarbageInput() {
        assertThat(jwtService.verify("not-a-jwt")).isEmpty();
    }

    private static void await(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
        }
    }
}
