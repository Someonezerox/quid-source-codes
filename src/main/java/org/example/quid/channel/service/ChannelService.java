package org.example.quid.channel.service;

import lombok.RequiredArgsConstructor;
import org.example.quid.channel.dto.ChannelResponse;
import org.example.quid.channel.entity.Channel;
import org.example.quid.channel.mapper.ChannelMapper;
import org.example.quid.channel.repository.ChannelRepository;
import org.example.quid.exception.ResourceNotFoundException;
import org.example.quid.workspace.entity.Workspace;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ChannelService {

    private final ChannelRepository channelRepository;
    private final ChannelMapper channelMapper;

    @Transactional(readOnly = true)
    public List<ChannelResponse> findAll(Workspace workspace) {
        return channelRepository.findAllByWorkspace(workspace).stream()
                .map(channelMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ChannelResponse findById(Long id, Workspace workspace) {
        return channelMapper.toResponse(getOrThrow(id, workspace));
    }

    public void deactivate(Long id, Workspace workspace) {
        getOrThrow(id, workspace).setActive(false);
    }

    private Channel getOrThrow(Long id, Workspace workspace) {
        return channelRepository.findByIdAndWorkspace(id, workspace)
                .orElseThrow(() -> new ResourceNotFoundException("Channel not found"));
    }
}
