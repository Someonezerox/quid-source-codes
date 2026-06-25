package org.example.quid.knowledge.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.quid.agent.entity.Agent;
import org.example.quid.agent.service.AgentService;
import org.example.quid.ai.client.EmbeddingClient;
import org.example.quid.ai.service.RagService;
import org.example.quid.exception.ResourceNotFoundException;
import org.example.quid.knowledge.dto.KnowledgeBaseRequest;
import org.example.quid.knowledge.dto.KnowledgeBaseResponse;
import org.example.quid.knowledge.dto.KnowledgeEntryRequest;
import org.example.quid.knowledge.dto.KnowledgeEntryResponse;
import org.example.quid.knowledge.entity.KnowledgeBase;
import org.example.quid.knowledge.entity.KnowledgeEntry;
import org.example.quid.knowledge.repository.KnowledgeBaseRepository;
import org.example.quid.knowledge.repository.KnowledgeEntryRepository;
import org.example.quid.workspace.entity.Workspace;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class KnowledgeService {

    private final KnowledgeBaseRepository kbRepository;
    private final KnowledgeEntryRepository entryRepository;
    private final EmbeddingClient embeddingClient;
    private final AgentService agentService;
    private final JdbcTemplate jdbc;

    // --- Knowledge Base ---

    public KnowledgeBaseResponse createBase(KnowledgeBaseRequest request, Workspace workspace) {
        Agent agent = agentService.getOrThrow(request.agentId(), workspace);
        KnowledgeBase kb = new KnowledgeBase();
        kb.setName(request.name());
        kb.setAgent(agent);
        return KnowledgeBaseResponse.from(kbRepository.save(kb));
    }

    @Transactional(readOnly = true)
    public List<KnowledgeBaseResponse> listBases(Long agentId, Workspace workspace) {
        Agent agent = agentService.getOrThrow(agentId, workspace);
        return kbRepository.findAllByAgent(agent).stream().map(KnowledgeBaseResponse::from).toList();
    }

    public void deleteBase(Long id, Workspace workspace) {
        KnowledgeBase kb = getKbOrThrow(id, workspace);
        kbRepository.delete(kb);
    }

    // --- Knowledge Entry ---

    public KnowledgeEntryResponse createEntry(Long kbId, KnowledgeEntryRequest request, Workspace workspace) {
        KnowledgeBase kb = getKbOrThrow(kbId, workspace);
        KnowledgeEntry entry = new KnowledgeEntry();
        entry.setKnowledgeBase(kb);
        entry.setTitle(request.title());
        entry.setContent(request.content());
        KnowledgeEntry saved = entryRepository.save(entry);
        embedAsync(saved.getId(), request.title() + "\n" + request.content());
        return KnowledgeEntryResponse.from(saved, false);
    }

    @Transactional(readOnly = true)
    public List<KnowledgeEntryResponse> listEntries(Long kbId, Workspace workspace) {
        KnowledgeBase kb = getKbOrThrow(kbId, workspace);
        return entryRepository.findAllByKnowledgeBase(kb).stream()
                .map(e -> KnowledgeEntryResponse.from(e, false))
                .toList();
    }

    public KnowledgeEntryResponse updateEntry(Long kbId, Long entryId, KnowledgeEntryRequest request, Workspace workspace) {
        getKbOrThrow(kbId, workspace);
        KnowledgeEntry entry = entryRepository.findByIdAndKnowledgeBase_Agent_Workspace_Id(entryId, workspace.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Entry not found"));
        entry.setTitle(request.title());
        entry.setContent(request.content());
        embedAsync(entry.getId(), request.title() + "\n" + request.content());
        return KnowledgeEntryResponse.from(entry, false);
    }

    public void deleteEntry(Long kbId, Long entryId, Workspace workspace) {
        getKbOrThrow(kbId, workspace);
        KnowledgeEntry entry = entryRepository.findByIdAndKnowledgeBase_Agent_Workspace_Id(entryId, workspace.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Entry not found"));
        entryRepository.delete(entry);
    }

    @Async
    public void embedAsync(Long entryId, String text) {
        float[] embedding = embeddingClient.embed(text);
        if (embedding.length == 0) return;
        jdbc.update("UPDATE knowledge_entries SET embedding = CAST(? AS vector) WHERE id = ?",
                RagService.toVectorString(embedding), entryId);
        log.debug("Embedding saved for entry {}", entryId);
    }

    private KnowledgeBase getKbOrThrow(Long id, Workspace workspace) {
        return kbRepository.findByIdAndAgent_Workspace_Id(id, workspace.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge base not found"));
    }
}
