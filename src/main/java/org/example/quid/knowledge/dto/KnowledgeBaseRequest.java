package org.example.quid.knowledge.dto;

import jakarta.validation.constraints.NotBlank;

public record KnowledgeBaseRequest(@NotBlank String name) {}
