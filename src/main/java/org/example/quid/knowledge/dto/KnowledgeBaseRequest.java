package org.example.quid.knowledge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record KnowledgeBaseRequest(@NotNull Long agentId, @NotBlank String name) {}
