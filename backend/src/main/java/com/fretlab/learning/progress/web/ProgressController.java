package com.fretlab.learning.progress.web;

import com.fretlab.learning.progress.Attempt;
import com.fretlab.learning.progress.AttemptRepository;
import com.fretlab.shared.error.ApiException;
import com.fretlab.shared.error.ErrorCode;
import com.fretlab.user.User;
import com.fretlab.user.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Requires a signed-in account (see {@code SecurityConfig}) — theory and practice stay usable
 * without one, but there is nothing to attach a mastery record to without a user.
 */
@Tag(name = "Progress", description = "Recorded exercise attempts and derived mastery")
@RestController
@RequestMapping("/api/progress")
class ProgressController {

    private final AttemptRepository attempts;
    private final UserRepository users;

    ProgressController(AttemptRepository attempts, UserRepository users) {
        this.attempts = attempts;
        this.users = users;
    }

    @Operation(summary = "Record one graded exercise attempt for the signed-in account")
    @PostMapping("/attempts")
    @ResponseStatus(HttpStatus.CREATED)
    void record(@Valid @RequestBody RecordAttemptRequest request, Authentication authentication) {
        User user = currentUser(authentication);
        attempts.save(new Attempt(user, request.exerciseType(), request.correct()));
    }

    @Operation(summary = "Mastery per exercise type, derived from every recorded attempt")
    @GetMapping("/summary")
    ProgressSummaryResponse summary(Authentication authentication) {
        User user = currentUser(authentication);
        return ProgressSummaryResponse.from(attempts.findByUser(user));
    }

    /**
     * The JWT filter authenticates by email alone (see {@code JwtAuthenticationFilter}); this is
     * the one place that needs the actual account row, to attach an attempt to it.
     */
    private User currentUser(Authentication authentication) {
        return users.findByEmail(authentication.getName())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHENTICATED,
                        "The account behind this session no longer exists."));
    }
}
