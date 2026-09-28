package com.fretlab.shared.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Application-owned configuration bound from the {@code fretlab.*} namespace.
 *
 * <p>Compact constructors normalise absent values so that callers never receive {@code null},
 * which lets configuration stay optional without spreading null checks through the code.
 */
@ConfigurationProperties("fretlab")
public record FretlabProperties(String version, Cors cors) {

    public FretlabProperties {
        cors = cors == null ? new Cors(null) : cors;
    }

    public record Cors(List<String> allowedOrigins) {

        public Cors {
            allowedOrigins = allowedOrigins == null ? List.of() : List.copyOf(allowedOrigins);
        }
    }
}
