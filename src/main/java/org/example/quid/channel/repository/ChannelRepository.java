package org.example.quid.channel.repository;

import org.example.quid.channel.entity.Channel;
import org.example.quid.workspace.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChannelRepository extends JpaRepository<Channel, Long> {
    List<Channel> findAllByWorkspace(Workspace workspace);
    Optional<Channel> findByIdAndWorkspace(Long id, Workspace workspace);
    Optional<Channel> findByBotToken(String botToken);
    boolean existsByBotTokenAndWorkspace(String botToken, Workspace workspace);
}
