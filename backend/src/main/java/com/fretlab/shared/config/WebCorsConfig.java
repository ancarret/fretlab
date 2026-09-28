package com.fretlab.shared.config;

import java.util.List;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Allows the Angular development server to call the API cross-origin.
 *
 * <p>Origins come from configuration rather than a wildcard, so a deployment that serves both apps
 * from one origin can simply supply an empty list and keep CORS switched off entirely.
 *
 * <p>This is a {@link CorsConfigurationSource} bean rather than a {@code WebMvcConfigurer}, because
 * {@code SecurityConfig} needs the exact same configuration: Spring Security's filter chain runs
 * before Spring MVC's handler mapping, so a CORS preflight {@code OPTIONS} request to a protected
 * endpoint would otherwise hit {@code anyRequest().authenticated()} and be rejected before Spring
 * MVC's own CORS handling ever saw it. Registering one source and pointing both at it keeps CORS
 * policy defined exactly once.
 */
@Configuration
@EnableConfigurationProperties(FretlabProperties.class)
class WebCorsConfig {

    private final FretlabProperties properties;

    WebCorsConfig(FretlabProperties properties) {
        this.properties = properties;
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // An empty list here means "no origin matches", which is exactly disabled — same effect as
        // never registering a mapping did under the previous WebMvcConfigurer-based approach.
        configuration.setAllowedOrigins(properties.cors().allowedOrigins());
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE"));
        configuration.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
