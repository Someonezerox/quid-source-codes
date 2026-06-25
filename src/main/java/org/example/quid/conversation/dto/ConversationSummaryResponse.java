package org.example.quid.conversation.dto;

import org.example.quid.conversation.enums.ConversationStatus;

import java.time.Instant;

public record ConversationSummaryResponse(
        Long id,
        ConversationStatus status,
        String customerFirstName,
        String customerLastName,
        Double confidenceScore,
        Instant updatedAt
) {}
