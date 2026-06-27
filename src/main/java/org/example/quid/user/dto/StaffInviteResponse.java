package org.example.quid.user.dto;

public record StaffInviteResponse(
        Long id,
        String email,
        String fullName,
        String tempPassword
) {}
