package org.example.quid.agent.dto;

import org.example.quid.agent.entity.Agent;

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
) {
    public static AgentResponse from(Agent a, long totalConversations, Double avgConfidenceScore) {
        return new AgentResponse(
                a.getId(), a.getName(), a.getDescription(),
                a.getConfidenceThreshold(), a.isActive(), a.getCreatedAt(),
                totalConversations, avgConfidenceScore
        );
    }
}
