package org.example.quid.knowledge.mapper;

import org.example.quid.agent.entity.Agent;
import org.example.quid.knowledge.dto.KnowledgeBaseResponse;
import org.example.quid.knowledge.dto.KnowledgeEntryRequest;
import org.example.quid.knowledge.dto.KnowledgeEntryResponse;
import org.example.quid.knowledge.entity.KnowledgeBase;
import org.example.quid.knowledge.entity.KnowledgeEntry;
import org.springframework.stereotype.Component;

@Component
public class KnowledgeMapper {

    public KnowledgeBaseResponse toBaseResponse(KnowledgeBase kb) {
        return new KnowledgeBaseResponse(kb.getId(), kb.getAgent().getId(), kb.getName(), kb.getCreatedAt());
    }

    public KnowledgeEntryResponse toEntryResponse(KnowledgeEntry entry, boolean embedded) {
        return new KnowledgeEntryResponse(
                entry.getId(), entry.getTitle(), entry.getContent(), embedded, entry.getCreatedAt()
        );
    }

    public KnowledgeBase toBaseEntity(String name, Agent agent) {
        KnowledgeBase kb = new KnowledgeBase();
        kb.setName(name);
        kb.setAgent(agent);
        return kb;
    }

    public KnowledgeEntry toEntryEntity(KnowledgeEntryRequest request, KnowledgeBase kb) {
        KnowledgeEntry entry = new KnowledgeEntry();
        entry.setKnowledgeBase(kb);
        update(entry, request);
        return entry;
    }

    public void update(KnowledgeEntry entry, KnowledgeEntryRequest request) {
        entry.setTitle(request.title());
        entry.setContent(request.content());
    }
}
