package com.fretlab.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * A registered account.
 *
 * <p>Not a record: JPA entities need a mutable, no-argument-constructible shape for Hibernate to
 * manage as a persistence-context proxy, which is exactly the ceremony records are designed to
 * avoid. DTOs stay records; this stays a plain class. The public constructor accepts only what a
 * new account needs — {@code id} and {@code createdAt} are assigned by the database and Hibernate.
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    /** Required by JPA; never called directly. */
    protected User() {
    }

    public User(String email, String passwordHash) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.createdAt = Instant.now();
    }

    public Long id() {
        return id;
    }

    public String email() {
        return email;
    }

    public String passwordHash() {
        return passwordHash;
    }

    public Instant createdAt() {
        return createdAt;
    }
}
