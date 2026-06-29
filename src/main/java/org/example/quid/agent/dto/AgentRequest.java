package org.example.quid.agent.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;

public record AgentRequest(
        @NotBlank String name,
        String description,
        @NotBlank String systemPrompt,
        String model,
        @DecimalMin("0.0") @DecimalMax("1.0") Double confidenceThreshold
) {}
