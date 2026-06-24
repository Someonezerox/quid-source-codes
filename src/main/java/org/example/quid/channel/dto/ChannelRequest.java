package org.example.quid.channel.dto;

import jakarta.validation.constraints.NotBlank;

public record ChannelRequest(
        @NotBlank String name,
        @NotBlank String botToken,
        String webhookUrl
) {}
