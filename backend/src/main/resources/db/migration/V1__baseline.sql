-- Baseline migration.
--
-- FretLab persists user-facing state only (accounts, lesson progress, exercise
-- attempts, mastery). Music theory itself is computed by the Java domain and is
-- deliberately NOT stored here, so no theory tables will ever appear.
--
-- This migration intentionally creates no objects: it establishes the Flyway
-- schema history baseline that later versioned migrations build on.

SELECT 1;
