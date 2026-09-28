package com.fretlab;

import static org.assertj.core.api.Assertions.assertThat;

import com.fretlab.shared.config.FretlabProperties;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.simple.JdbcClient;

/**
 * Boots the whole application against a real PostgreSQL container.
 *
 * <p>This is the test that proves the Phase 1 foundation actually holds together: the context
 * starts, Flyway owns the schema, and Maven's build version reaches runtime configuration.
 */
@Import(TestcontainersConfiguration.class)
@SpringBootTest
class ApplicationIntegrationTest {

    @Autowired
    private JdbcClient jdbcClient;

    @Autowired
    private FretlabProperties properties;

    @Test
    void flywayAppliesTheBaselineMigration() {
        var applied = jdbcClient
                .sql("select version from flyway_schema_history order by installed_rank")
                .query(String.class)
                .list();

        assertThat(applied).containsExactly("1", "2", "3");
    }

    @Test
    void mavenFiltersTheBuildVersionIntoConfiguration() {
        assertThat(properties.version())
                .as("resource filtering must replace the @project.version@ placeholder")
                .doesNotContain("@")
                .isNotBlank();
    }
}
