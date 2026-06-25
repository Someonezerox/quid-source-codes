package org.example.quid.channel.mapper;

import org.example.quid.channel.dto.ChannelRequest;
import org.example.quid.channel.dto.ChannelResponse;
import org.example.quid.channel.entity.Channel;
import org.example.quid.channel.enums.ChannelType;
import org.example.quid.workspace.entity.Workspace;
import org.springframework.stereotype.Component;

@Component
public class ChannelMapper {

    public ChannelResponse toResponse(Channel channel) {
        return new ChannelResponse(
                channel.getId(),
                channel.getName(),
                channel.getType(),
                channel.getWebhookUrl(),
                channel.isActive(),
                channel.getAssignedAgent() != null ? channel.getAssignedAgent().getId() : null,
                channel.getCreatedAt()
        );
    }

    public Channel toEntity(ChannelRequest request, Workspace workspace) {
        Channel channel = new Channel();
        channel.setType(ChannelType.TELEGRAM);
        channel.setWorkspace(workspace);
        update(channel, request);
        return channel;
    }

    public void update(Channel channel, ChannelRequest request) {
        channel.setName(request.name());
        channel.setBotToken(request.botToken());
        channel.setWebhookUrl(request.webhookUrl());
    }
}
