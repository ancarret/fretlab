package com.fretlab;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@ConfigurationPropertiesScan
@SpringBootApplication
public class FretlabBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(FretlabBackendApplication.class, args);
    }

}
