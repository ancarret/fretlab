package com.fretlab.auth;

import com.fretlab.shared.error.ApiException;
import com.fretlab.shared.error.ErrorCode;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Clock;
import java.time.Duration;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

/**
 * A fixed-window, per-client request limiter for the endpoints an attacker would hammer: password
 * guessing on login, account spam on registration, and row spam on attempt recording.
 *
 * <p>In-memory on purpose. The service runs as a single instance, so a shared store (Redis) would
 * add infrastructure to defend against a multi-instance scenario that does not exist. If the API
 * is ever scaled horizontally, this is the one class to replace — each instance would otherwise
 * allow its own full quota.
 *
 * <p>The client key is {@link HttpServletRequest#getRemoteAddr()}, which is the real client address
 * only because {@code server.forward-headers-strategy=framework} resolves {@code X-Forwarded-For}
 * from the platform's proxy; without that every request would share the proxy's address.
 */
class RateLimitFilter extends OncePerRequestFilter {

    /** Bounds memory: beyond this many tracked clients, expired windows are swept first. */
    private static final int SWEEP_THRESHOLD = 10_000;

    record Rule(String method, String path, int maxRequests, Duration window) {
    }

    private record Window(long startedAtMillis, int count) {
    }

    private final Clock clock;
    private final HandlerExceptionResolver exceptionResolver;
    private final java.util.List<Rule> rules;
    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    RateLimitFilter(Clock clock, HandlerExceptionResolver exceptionResolver, java.util.List<Rule> rules) {
        this.clock = clock;
        this.exceptionResolver = exceptionResolver;
        this.rules = rules;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {

        Rule rule = matchingRule(request);
        if (rule != null && !tryAcquire(rule, request.getRemoteAddr())) {
            response.setHeader("Retry-After", String.valueOf(rule.window().toSeconds()));
            exceptionResolver.resolveException(request, response, null,
                    new ApiException(HttpStatus.TOO_MANY_REQUESTS, ErrorCode.RATE_LIMITED,
                            "Too many requests. Please wait a moment and try again."));
            return;
        }
        chain.doFilter(request, response);
    }

    private Rule matchingRule(HttpServletRequest request) {
        for (Rule rule : rules) {
            if (rule.method().equals(request.getMethod()) && rule.path().equals(request.getRequestURI())) {
                return rule;
            }
        }
        return null;
    }

    private boolean tryAcquire(Rule rule, String client) {
        long now = clock.millis();
        if (windows.size() > SWEEP_THRESHOLD) {
            sweep(now, rule.window().toMillis());
        }
        boolean[] allowed = {true};
        windows.compute(rule.method() + " " + rule.path() + " " + client, (key, current) -> {
            if (current == null || now - current.startedAtMillis() >= rule.window().toMillis()) {
                return new Window(now, 1);
            }
            if (current.count() >= rule.maxRequests()) {
                allowed[0] = false;
                return current;
            }
            return new Window(current.startedAtMillis(), current.count() + 1);
        });
        return allowed[0];
    }

    private void sweep(long now, long windowMillis) {
        Iterator<Window> iterator = windows.values().iterator();
        while (iterator.hasNext()) {
            if (now - iterator.next().startedAtMillis() >= windowMillis) {
                iterator.remove();
            }
        }
    }
}
