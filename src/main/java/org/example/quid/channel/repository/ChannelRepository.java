package org.example.quid.channel.repository;

import org.example.quid.agent.entity.Agent;
import org.example.quid.channel.entity.Channel;
import org.example.quid.workspace.entity.Workspace;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChannelRepository extends JpaRepository<Channel, Long> {
    @EntityGraph(attributePaths = {"assignedAgent"})
    List<Channel> findAllByWorkspace(Workspace workspace);

    @EntityGraph(attributePaths = {"assignedAgent"})
    Optional<Channel> findByIdAndWorkspace(Long id, Workspace workspace);

    List<Channel> findAllByAssignedAgent(Agent agent);

    @EntityGraph(attributePaths = {"assignedAgent"})
    Optional<Channel> findByUserbotSessionId(String userbotSessionId);
}
