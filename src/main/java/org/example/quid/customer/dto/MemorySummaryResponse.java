package org.example.quid.customer.dto;

import java.time.Instant;

public record MemorySummaryResponse(Long id, Long conversationId, String content, Instant createdAt) {}
