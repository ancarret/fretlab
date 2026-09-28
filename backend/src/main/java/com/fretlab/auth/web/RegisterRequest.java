package com.fretlab.auth.web;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Email String email,
        // BCrypt silently ignores bytes past 72, so a longer password would not do what it looks
        // like it does — capping the input here makes that limit visible instead of surprising.
        @NotBlank @Size(min = 8, max = 72) String password) {
}
