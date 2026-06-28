package org.example.quid.customer.dto;

import java.time.Instant;
import java.util.List;

public record CustomerProfileResponse(
        Long id,
        String firstName,
        String lastName,
        String username,
        Long telegramId,
        String notes,
        Instant lastSeenAt,
        long totalConversations,
        List<PreferenceResponse> preferences
) {}
