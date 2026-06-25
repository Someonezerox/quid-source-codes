package org.example.quid.knowledge.dto;

import java.time.Instant;

public record KnowledgeBaseResponse(Long id, Long agentId, String name, Instant createdAt) {}
