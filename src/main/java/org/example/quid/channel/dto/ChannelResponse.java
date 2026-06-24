package org.example.quid.channel.dto;

import org.example.quid.channel.entity.Channel;
import org.example.quid.channel.enums.ChannelType;

import java.time.Instant;

public record ChannelResponse(
        Long id,
        String name,
        ChannelType type,
        String webhookUrl,
        boolean active,
        Instant createdAt
) {
    public static ChannelResponse from(Channel c) {
        return new ChannelResponse(c.getId(), c.getName(), c.getType(), c.getWebhookUrl(), c.isActive(), c.getCreatedAt());
    }
}
