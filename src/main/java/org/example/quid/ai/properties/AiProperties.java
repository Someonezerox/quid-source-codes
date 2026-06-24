package org.example.quid.ai.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ai")
public record AiProperties(
        String anthropicApiKey,
        String anthropicModel,
        String openaiApiKey,
        int maxHistoryMessages,
        int ragTopK
) {
    public AiProperties {
        if (anthropicModel == null || anthropicModel.isBlank()) anthropicModel = "claude-haiku-4-5-20251001";
        if (maxHistoryMessages == 0) maxHistoryMessages = 10;
        if (ragTopK == 0) ragTopK = 5;
    }
}
