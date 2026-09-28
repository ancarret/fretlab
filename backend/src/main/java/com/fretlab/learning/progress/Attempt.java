package com.fretlab.learning.progress;

import com.fretlab.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * One graded exercise attempt. Mastery is never stored directly — it is always computed from these
 * rows by {@link Mastery#summarize}, so it can never drift from the attempts it is supposed to
 * summarise the way a separately maintained running total could.
 */
@Entity
@Table(name = "exercise_attempts")
public class Attempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "exercise_type", nullable = false)
    private ExerciseType exerciseType;

    @Column(nullable = false)
    private boolean correct;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;

    /** Required by JPA; never called directly. */
    protected Attempt() {
    }

    public Attempt(User user, ExerciseType exerciseType, boolean correct) {
        this.user = user;
        this.exerciseType = exerciseType;
        this.correct = correct;
        this.recordedAt = Instant.now();
    }

    public Long id() {
        return id;
    }

    public User user() {
        return user;
    }

    public ExerciseType exerciseType() {
        return exerciseType;
    }

    public boolean correct() {
        return correct;
    }

    public Instant recordedAt() {
        return recordedAt;
    }
}
