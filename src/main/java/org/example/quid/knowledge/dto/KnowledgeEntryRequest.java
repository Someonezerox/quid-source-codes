package org.example.quid.knowledge.dto;

import jakarta.validation.constraints.NotBlank;

public record KnowledgeEntryRequest(@NotBlank String title, @NotBlank String content) {}
