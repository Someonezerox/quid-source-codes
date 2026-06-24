package org.example.quid.telegram.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TelegramUser(
        Long id,
        @JsonProperty("first_name") String firstName,
        @JsonProperty("last_name") String lastName,
        String username
) {}
