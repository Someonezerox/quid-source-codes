package org.example.quid.channel.mapper;

import org.example.quid.channel.dto.ChannelResponse;
import org.example.quid.channel.entity.Channel;
import org.springframework.stereotype.Component;

@Component
public class ChannelMapper {

    public ChannelResponse toResponse(Channel channel) {
        return new ChannelResponse(
                channel.getId(),
                channel.getName(),
                channel.getType(),
                channel.isActive(),
                channel.getAssignedAgent() != null ? channel.getAssignedAgent().getId() : null,
                channel.getAllowedChatId(),
                channel.getCreatedAt()
        );
    }
}
