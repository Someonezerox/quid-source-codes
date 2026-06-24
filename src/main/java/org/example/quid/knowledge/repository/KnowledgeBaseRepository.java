package org.example.quid.knowledge.repository;

import org.example.quid.knowledge.entity.KnowledgeBase;
import org.example.quid.workspace.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface KnowledgeBaseRepository extends JpaRepository<KnowledgeBase, Long> {
    List<KnowledgeBase> findAllByWorkspace(Workspace workspace);
}
