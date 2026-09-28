-- One row per graded exercise attempt. Mastery is a query over this table, not a separately
-- stored, separately maintained number that could drift from the attempts it summarises.

CREATE TABLE exercise_attempts (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT      NOT NULL REFERENCES users (id),
    exercise_type VARCHAR(50) NOT NULL,
    correct       BOOLEAN     NOT NULL,
    recorded_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_exercise_attempts_user ON exercise_attempts (user_id);
