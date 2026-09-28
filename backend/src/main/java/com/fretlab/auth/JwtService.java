package com.fretlab.auth;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import javax.crypto.SecretKey;

/**
 * Issues and verifies the JWTs that carry a logged-in user's identity between requests.
 *
 * <p>Deliberately framework-free: this class knows nothing about Spring or HTTP, only how to turn
 * an email into a signed token and back. That keeps it unit-testable without a servlet context and
 * reusable if the transport ever changes.
 *
 * <p><strong>Why JWT, not server-side sessions.</strong> A session needs server-side storage
 * (in-memory or a shared store) that every instance of a horizontally-scaled API must consult on
 * every request. A JWT is self-contained and verified with only the signing key, which is what
 * "stateless" means in {@code SessionCreationPolicy.STATELESS}. The trade-off: a JWT cannot be
 * revoked before it expires without extra infrastructure (a blocklist), which is why the expiry
 * below is kept short rather than the weeks-long lifetime a session cookie might use.
 */
public class JwtService {

    private final SecretKey key;
    private final Duration expiration;

    public JwtService(String secret, Duration expiration) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiration = expiration;
    }

    /** A signed token whose subject is {@code email}, valid for this service's configured expiry. */
    public String issue(String email) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(email)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(expiration)))
                .signWith(key)
                .compact();
    }

    /** The token's subject (the account email) if it is validly signed and not expired. */
    public Optional<String> verify(String token) {
        try {
            String subject = Jwts.parser().verifyWith(key).build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
            return Optional.ofNullable(subject);
        } catch (JwtException | IllegalArgumentException ex) {
            return Optional.empty();
        }
    }
}
