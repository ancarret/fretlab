package com.fretlab.system;

import com.fretlab.shared.config.FretlabProperties;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.Instant;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Reachability probe for the API.
 *
 * <p>Deliberately shallow: it answers "can a client reach this application and which build is
 * running", not "are its dependencies healthy". Dependency checks belong to Spring Boot Actuator,
 * which the observability milestone will introduce.
 */
@Tag(name = "System", description = "Operational endpoints")
@RestController
@RequestMapping("/api/health")
class HealthController {

    private final FretlabProperties properties;

    HealthController(FretlabProperties properties) {
        this.properties = properties;
    }

    @Operation(summary = "Confirms the API is reachable and reports the running build")
    @GetMapping
    HealthResponse health() {
        return new HealthResponse("UP", properties.version(), Instant.now());
    }
}
