package com.fretlab.auth;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Bound from {@code fretlab.jwt.*}. The committed default secret is a local-development
 * convenience only — see {@code .env.example} — and must be overridden with a real secret in any
 * deployed environment via {@code FRETLAB_JWT_SECRET}.
 */
@ConfigurationProperties("fretlab.jwt")
public record JwtProperties(String secret, long expirationMinutes) {

    public JwtProperties {
        expirationMinutes = expirationMinutes <= 0 ? 60 : expirationMinutes;
    }
}
