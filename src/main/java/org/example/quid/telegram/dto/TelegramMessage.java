package org.example.quid.telegram.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TelegramMessage(
        @JsonProperty("message_id") Long messageId,
        TelegramUser from,
        String text
) {}
