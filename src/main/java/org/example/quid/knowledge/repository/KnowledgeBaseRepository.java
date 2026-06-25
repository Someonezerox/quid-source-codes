package org.example.quid.knowledge.repository;

import org.example.quid.agent.entity.Agent;
import org.example.quid.knowledge.entity.KnowledgeBase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface KnowledgeBaseRepository extends JpaRepository<KnowledgeBase, Long> {
    List<KnowledgeBase> findAllByAgent(Agent agent);
    Optional<KnowledgeBase> findByIdAndAgent_Workspace_Id(Long id, Long workspaceId);
}
