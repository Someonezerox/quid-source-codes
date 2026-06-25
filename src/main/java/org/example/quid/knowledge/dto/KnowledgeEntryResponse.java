package org.example.quid.knowledge.dto;

import java.time.Instant;

public record KnowledgeEntryResponse(Long id, String title, String content, boolean embedded, Instant createdAt) {}
