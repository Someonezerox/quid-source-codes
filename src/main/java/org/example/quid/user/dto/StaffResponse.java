package org.example.quid.user.dto;

import org.example.quid.user.enums.Role;

public record StaffResponse(
        Long id,
        String email,
        String fullName,
        Role role,
        boolean enabled
) {}
