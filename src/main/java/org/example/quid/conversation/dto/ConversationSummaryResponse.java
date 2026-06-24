package org.example.quid.conversation.dto;

import org.example.quid.conversation.entity.Conversation;
import org.example.quid.conversation.enums.ConversationStatus;

import java.time.Instant;

public record ConversationSummaryResponse(
        Long id,
        ConversationStatus status,
        String customerFirstName,
        String customerLastName,
        Double confidenceScore,
        Instant updatedAt
) {
    public static ConversationSummaryResponse from(Conversation c) {
        return new ConversationSummaryResponse(
                c.getId(), c.getStatus(),
                c.getCustomer().getFirstName(), c.getCustomer().getLastName(),
                c.getConfidenceScore(), c.getUpdatedAt()
        );
    }
}
