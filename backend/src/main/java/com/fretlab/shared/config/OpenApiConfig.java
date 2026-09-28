package com.fretlab.shared.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class OpenApiConfig {

    @Bean
    OpenAPI fretlabOpenApi(FretlabProperties properties) {
        return new OpenAPI().info(new Info()
                .title("FretLab API")
                .description("Interactive Guitar Theory Learning Platform")
                .version(properties.version()));
    }
}
