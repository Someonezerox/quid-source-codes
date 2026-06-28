package org.example.quid.auth.dto;

public record MeResponse(
        Long id,
        String email,
        String fullName,
        String role,
        Long workspaceId,
        String workspaceName
) {}
