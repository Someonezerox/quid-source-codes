package org.example.quid.agent.repository;

import org.example.quid.agent.entity.Agent;
import org.example.quid.workspace.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AgentRepository extends JpaRepository<Agent, Long> {
    List<Agent> findAllByWorkspace(Workspace workspace);
    Optional<Agent> findByIdAndWorkspace(Long id, Workspace workspace);
}
