package org.example.quid.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record StaffInviteRequest(
        @Email @NotBlank String email,
        @NotBlank String fullName
) {}
