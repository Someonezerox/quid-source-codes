package org.example.quid.channel.dto;

import org.example.quid.channel.enums.ChannelType;

import java.time.Instant;

public record ChannelResponse(
        Long id,
        String name,
        ChannelType type,
        boolean active,
        Long assignedAgentId,
        Long allowedChatId,
        Instant createdAt
) {}
