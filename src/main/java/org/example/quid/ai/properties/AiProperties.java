package org.example.quid.ai.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ai")
public record AiProperties(
        String openRouterApiKey,
        String chatModel,
        String embeddingModel,
        int maxHistoryMessages,
        int ragTopK,
        int memoryDepth
) {
    public AiProperties {
        if (chatModel == null || chatModel.isBlank()) chatModel = "anthropic/claude-haiku-4-5-20251001";
        if (embeddingModel == null || embeddingModel.isBlank()) embeddingModel = "openai/text-embedding-3-small";
        if (maxHistoryMessages == 0) maxHistoryMessages = 10;
        if (ragTopK == 0) ragTopK = 5;
        if (memoryDepth == 0) memoryDepth = 3;
    }
}
