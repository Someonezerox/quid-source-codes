package org.example.quid.channel.service;

import lombok.RequiredArgsConstructor;
import org.example.quid.channel.dto.ChannelRequest;
import org.example.quid.channel.dto.ChannelResponse;
import org.example.quid.channel.entity.Channel;
import org.example.quid.channel.enums.ChannelType;
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

    public ChannelResponse create(ChannelRequest request, Workspace workspace) {
        if (channelRepository.existsByBotTokenAndWorkspace(request.botToken(), workspace)) {
            throw new ConflictException("Bot token already registered in this workspace");
        }
        Channel channel = new Channel();
        channel.setName(request.name());
        channel.setBotToken(request.botToken());
        channel.setWebhookUrl(request.webhookUrl());
        channel.setType(ChannelType.TELEGRAM);
        channel.setWorkspace(workspace);
        return ChannelResponse.from(channelRepository.save(channel));
    }

    @Transactional(readOnly = true)
    public List<ChannelResponse> findAll(Workspace workspace) {
        return channelRepository.findAllByWorkspace(workspace).stream()
                .map(ChannelResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ChannelResponse findById(Long id, Workspace workspace) {
        return ChannelResponse.from(getOrThrow(id, workspace));
    }

    public ChannelResponse update(Long id, ChannelRequest request, Workspace workspace) {
        Channel channel = getOrThrow(id, workspace);
        channel.setName(request.name());
        channel.setBotToken(request.botToken());
        channel.setWebhookUrl(request.webhookUrl());
        return ChannelResponse.from(channel);
    }

    public void deactivate(Long id, Workspace workspace) {
        getOrThrow(id, workspace).setActive(false);
    }

    private Channel getOrThrow(Long id, Workspace workspace) {
        return channelRepository.findByIdAndWorkspace(id, workspace)
                .orElseThrow(() -> new ResourceNotFoundException("Channel not found"));
    }
}
