package com.fretlab.auth;

import com.fretlab.shared.error.ApiException;
import com.fretlab.shared.error.ErrorCode;
import java.time.Clock;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.servlet.HandlerExceptionResolver;

/**
 * FretLab's REST API is a stateless JWT bearer API: no login form, no CSRF-vulnerable cookies, no
 * server-side session store. Theory and practice endpoints stay public — they need no account — and
 * everything else requires a valid {@code Authorization: Bearer <token>} header.
 */
@Configuration
@EnableWebSecurity
@EnableConfigurationProperties(JwtProperties.class)
class SecurityConfig {

    /**
     * Login and registration are the brute-force targets; attempt recording is the only
     * authenticated write an account can repeat endlessly, so it is capped to keep a single
     * account from filling the database.
     */
    private static final java.util.List<RateLimitFilter.Rule> RATE_LIMITS = java.util.List.of(
            new RateLimitFilter.Rule("POST", "/api/auth/login", 10, Duration.ofMinutes(1)),
            new RateLimitFilter.Rule("POST", "/api/auth/register", 5, Duration.ofMinutes(10)),
            new RateLimitFilter.Rule("POST", "/api/progress/attempts", 120, Duration.ofMinutes(1)));

    @Bean
    PasswordEncoder passwordEncoder() {
        // BCrypt: a slow, salted hash purpose-built for passwords, unlike a fast general-purpose
        // hash such as SHA-256 that makes brute-forcing a stolen hash dump cheap.
        return new BCryptPasswordEncoder();
    }

    @Bean
    JwtService jwtService(JwtProperties properties) {
        return new JwtService(properties.secret(), Duration.ofMinutes(properties.expirationMinutes()));
    }

    @Bean
    SecurityFilterChain filterChain(
            HttpSecurity http,
            JwtService jwtService,
            CorsConfigurationSource corsConfigurationSource,
            @Qualifier("handlerExceptionResolver") HandlerExceptionResolver exceptionResolver,
            @org.springframework.beans.factory.annotation.Value("${fretlab.rate-limit.enabled:true}")
                    boolean rateLimitEnabled)
            throws Exception {
        http
                // Without this, Spring Security's filter chain runs before Spring MVC's own CORS
                // handling ever sees the request, so a preflight OPTIONS to a protected endpoint
                // would hit anyRequest().authenticated() and fail — this makes Security itself
                // short-circuit CORS preflight requests before authorization is even evaluated.
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                // CSRF defends session cookies used by a browser to submit state-changing forms.
                // A stateless bearer-token API has no session cookie for a forged request to ride
                // on, so there is nothing here for CSRF protection to defend.
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/auth/register", "/api/auth/login",
                                "/api/health",
                                "/api/theory/**", "/api/practice/**",
                                "/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**")
                        .permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(problemDetailEntryPoint(exceptionResolver)))
                .addFilterBefore(new RateLimitFilter(Clock.systemUTC(), exceptionResolver,
                        rateLimitEnabled ? RATE_LIMITS : java.util.List.of()),
                        UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(new JwtAuthenticationFilter(jwtService), UsernamePasswordAuthenticationFilter.class)
                .headers(headers -> headers
                        .referrerPolicy(referrer -> referrer.policy(
                                org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter
                                        .ReferrerPolicy.NO_REFERRER)));

        return http.build();
    }

    /**
     * Spring Security rejects an unauthenticated request from a filter, before the request ever
     * reaches a controller — {@code GlobalExceptionHandler} is a {@code @RestControllerAdvice} and
     * only runs for exceptions the {@code DispatcherServlet} sees. Handing the rejection to Spring
     * MVC's own {@link HandlerExceptionResolver} (the mechanism that invokes {@code @ExceptionHandler}
     * methods) routes it through that same handler anyway, so a 401 gets the identical
     * {@code ProblemDetail} shape as every other error rather than a second, hand-built response.
     */
    private static AuthenticationEntryPoint problemDetailEntryPoint(HandlerExceptionResolver resolver) {
        return (request, response, authException) -> resolver.resolveException(request, response, null,
                new ApiException(HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHENTICATED,
                        "Authentication is required."));
    }
}
