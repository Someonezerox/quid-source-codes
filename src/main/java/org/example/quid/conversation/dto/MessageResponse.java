package org.example.quid.conversation.dto;

import org.example.quid.conversation.enums.MessageRole;

import java.time.Instant;

public record MessageResponse(
        Long id,
        MessageRole role,
        String content,
        Instant createdAt
) {}
