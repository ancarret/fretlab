package com.fretlab.auth.web;

import com.fretlab.auth.JwtService;
import com.fretlab.shared.error.ApiException;
import com.fretlab.shared.error.ErrorCode;
import com.fretlab.user.User;
import com.fretlab.user.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Auth", description = "Registration, login and the current session")
@RestController
@RequestMapping("/api/auth")
class AuthController {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    AuthController(UserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Operation(summary = "Create an account and return a session token")
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        if (users.existsByEmail(request.email())) {
            throw new ApiException(HttpStatus.CONFLICT, ErrorCode.EMAIL_ALREADY_REGISTERED,
                    "An account with this email already exists.");
        }
        User user = new User(request.email(), passwordEncoder.encode(request.password()));
        users.save(user);
        return new AuthResponse(jwtService.issue(user.email()), user.email());
    }

    @Operation(summary = "Exchange credentials for a session token")
    @PostMapping("/login")
    AuthResponse login(@Valid @RequestBody LoginRequest request) {
        User user = users.findByEmail(request.email())
                .filter(candidate -> passwordEncoder.matches(request.password(), candidate.passwordHash()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS,
                        "Email or password is incorrect."));
        return new AuthResponse(jwtService.issue(user.email()), user.email());
    }

    @Operation(summary = "The account behind the current session token")
    @GetMapping("/me")
    UserResponse me(Authentication authentication) {
        // Reaching here at all means SecurityConfig already required a valid token, so the
        // principal is trusted without re-checking the database.
        return new UserResponse(authentication.getName());
    }
}
