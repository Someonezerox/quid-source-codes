package org.example.quid.agent.dto;

import java.time.Instant;

public record AgentResponse(
        Long id,
        String name,
        String description,
        double confidenceThreshold,
        boolean active,
        Instant createdAt,
        long totalConversations,
        Double avgConfidenceScore
) {}
