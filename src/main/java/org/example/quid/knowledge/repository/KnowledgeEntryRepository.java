package org.example.quid.knowledge.repository;

import org.example.quid.knowledge.entity.KnowledgeBase;
import org.example.quid.knowledge.entity.KnowledgeEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface KnowledgeEntryRepository extends JpaRepository<KnowledgeEntry, Long> {
    List<KnowledgeEntry> findAllByKnowledgeBase(KnowledgeBase knowledgeBase);
    Optional<KnowledgeEntry> findByIdAndKnowledgeBase_Agent_Workspace_Id(Long id, Long workspaceId);

    @Query(value = """
            SELECT ke.id FROM knowledge_entries ke
            JOIN knowledge_bases kb ON ke.knowledge_base_id = kb.id
            WHERE kb.agent_id = :agentId AND ke.embedding IS NOT NULL
            ORDER BY ke.embedding <=> CAST(:queryVector AS vector)
            LIMIT :k
            """, nativeQuery = true)
    List<Long> findTopKByEmbeddingSimilarity(@Param("agentId") Long agentId,
                                             @Param("queryVector") String queryVector,
                                             @Param("k") int k);
}
