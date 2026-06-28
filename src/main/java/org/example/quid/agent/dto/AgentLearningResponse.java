package org.example.quid.agent.dto;

public record AgentLearningResponse(
        long totalHandled,
        long resolvedByAi,
        double resolutionRate,
        Double avgConfidenceScore
) {}
