-- Accounts. Passwords are never stored in plain text: password_hash holds a BCrypt hash produced
-- by Spring Security's PasswordEncoder, never the password itself.

CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
