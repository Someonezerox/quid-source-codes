package org.example.quid.knowledge.dto;

import org.example.quid.knowledge.entity.KnowledgeBase;

import java.time.Instant;

public record KnowledgeBaseResponse(Long id, String name, Instant createdAt) {
    public static KnowledgeBaseResponse from(KnowledgeBase kb) {
        return new KnowledgeBaseResponse(kb.getId(), kb.getName(), kb.getCreatedAt());
    }
}
