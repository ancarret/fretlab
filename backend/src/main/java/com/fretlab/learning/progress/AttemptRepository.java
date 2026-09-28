package com.fretlab.learning.progress;

import com.fretlab.user.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttemptRepository extends JpaRepository<Attempt, Long> {

    List<Attempt> findByUser(User user);
}
