package com.fretlab.auth;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.servlet.HandlerExceptionResolver;

class RateLimitFilterTest {

    private static final List<RateLimitFilter.Rule> RULES =
            List.of(new RateLimitFilter.Rule("POST", "/api/auth/login", 3, Duration.ofMinutes(1)));

    private final MutableClock clock = new MutableClock();
    private final HandlerExceptionResolver rejecting = (request, response, handler, ex) -> {
        response.setStatus(429);
        return new org.springframework.web.servlet.ModelAndView();
    };
    private final RateLimitFilter filter = new RateLimitFilter(clock, rejecting, RULES);

    @Test
    void allowsRequestsUpToTheLimitThenRejectsWithRetryAfter() throws Exception {
        for (int i = 0; i < 3; i++) {
            assertThat(post("/api/auth/login", "1.1.1.1").getStatus()).isEqualTo(200);
        }
        MockHttpServletResponse blocked = post("/api/auth/login", "1.1.1.1");

        assertThat(blocked.getStatus()).isEqualTo(429);
        assertThat(blocked.getHeader("Retry-After")).isEqualTo("60");
    }

    @Test
    void limitsEachClientIndependently() throws Exception {
        for (int i = 0; i < 4; i++) {
            post("/api/auth/login", "1.1.1.1");
        }

        assertThat(post("/api/auth/login", "2.2.2.2").getStatus()).isEqualTo(200);
    }

    @Test
    void allowsRequestsAgainOnceTheWindowHasPassed() throws Exception {
        for (int i = 0; i < 4; i++) {
            post("/api/auth/login", "1.1.1.1");
        }
        clock.advance(Duration.ofMinutes(1));

        assertThat(post("/api/auth/login", "1.1.1.1").getStatus()).isEqualTo(200);
    }

    @Test
    void neverLimitsEndpointsWithoutARule() throws Exception {
        for (int i = 0; i < 50; i++) {
            assertThat(post("/api/theory/notes", "1.1.1.1").getStatus()).isEqualTo(200);
        }
    }

    private MockHttpServletResponse post(String path, String client) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", path);
        request.setRemoteAddr(client);
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());
        return response;
    }

    private static final class MutableClock extends Clock {
        private Instant now = Instant.parse("2026-01-01T00:00:00Z");

        void advance(Duration duration) {
            now = now.plus(duration);
        }

        @Override
        public java.time.ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(java.time.ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return now;
        }
    }
}
