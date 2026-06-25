package org.example.quid.channel.service;

import lombok.RequiredArgsConstructor;
import org.example.quid.channel.dto.ChannelRequest;
import org.example.quid.channel.dto.ChannelResponse;
import org.example.quid.channel.entity.Channel;
import org.example.quid.channel.mapper.ChannelMapper;
import org.example.quid.channel.repository.ChannelRepository;
import org.example.quid.exception.ConflictException;
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

    public ChannelResponse create(ChannelRequest request, Workspace workspace) {
        if (channelRepository.existsByBotTokenAndWorkspace(request.botToken(), workspace)) {
            throw new ConflictException("Bot token already registered in this workspace");
        }
        return channelMapper.toResponse(channelRepository.save(channelMapper.toEntity(request, workspace)));
    }

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

    public ChannelResponse update(Long id, ChannelRequest request, Workspace workspace) {
        Channel channel = getOrThrow(id, workspace);
        channelMapper.update(channel, request);
        return channelMapper.toResponse(channel);
    }

    public void deactivate(Long id, Workspace workspace) {
        getOrThrow(id, workspace).setActive(false);
    }

    private Channel getOrThrow(Long id, Workspace workspace) {
        return channelRepository.findByIdAndWorkspace(id, workspace)
                .orElseThrow(() -> new ResourceNotFoundException("Channel not found"));
    }
}
