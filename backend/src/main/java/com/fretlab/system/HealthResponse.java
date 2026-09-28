package com.fretlab.system;

import java.time.Instant;

public record HealthResponse(String status, String version, Instant timestamp) {
}
