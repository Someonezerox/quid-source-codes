package org.example.quid.conversation.repository;

import org.example.quid.conversation.entity.Conversation;
import org.example.quid.conversation.enums.ConversationStatus;
import org.example.quid.customer.entity.Customer;
import org.example.quid.workspace.entity.Workspace;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    @EntityGraph(attributePaths = {"customer", "assignedAgent"})
    Page<Conversation> findAllByWorkspace(Workspace workspace, Pageable pageable);

    @EntityGraph(attributePaths = {"customer", "assignedAgent"})
    Page<Conversation> findAllByWorkspaceAndStatus(Workspace workspace, ConversationStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"customer", "channel"})
    Optional<Conversation> findByIdAndWorkspace(Long id, Workspace workspace);

    Optional<Conversation> findTopByCustomerAndStatusNotOrderByCreatedAtDesc(Customer customer, ConversationStatus status);

    @EntityGraph(attributePaths = {"customer", "channel", "channel.assignedAgent", "workspace"})
    @Query("SELECT c FROM Conversation c WHERE c.id = :id")
    Optional<Conversation> findByIdWithDetails(@Param("id") Long id);

    long countByAiAgent_Id(Long agentId);

    @Query("SELECT AVG(c.confidenceScore) FROM Conversation c WHERE c.aiAgent.id = :agentId AND c.confidenceScore IS NOT NULL")
    Double avgConfidenceByAiAgentId(@Param("agentId") Long agentId);
}
