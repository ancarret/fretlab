package com.fretlab;

import org.springframework.boot.SpringApplication;

public class TestFretlabBackendApplication {

	public static void main(String[] args) {
		SpringApplication.from(FretlabBackendApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
