package org.example.quid.knowledge.dto;

import org.example.quid.knowledge.entity.KnowledgeEntry;

import java.time.Instant;

public record KnowledgeEntryResponse(Long id, String title, String content, boolean embedded, Instant createdAt) {
    public static KnowledgeEntryResponse from(KnowledgeEntry e, boolean embedded) {
        return new KnowledgeEntryResponse(e.getId(), e.getTitle(), e.getContent(), embedded, e.getCreatedAt());
    }
}
