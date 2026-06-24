package org.example.quid.conversation.dto;

import org.example.quid.conversation.entity.Message;
import org.example.quid.conversation.enums.MessageRole;

import java.time.Instant;

public record MessageResponse(
        Long id,
        MessageRole role,
        String content,
        Instant createdAt
) {
    public static MessageResponse from(Message m) {
        return new MessageResponse(m.getId(), m.getRole(), m.getContent(), m.getCreatedAt());
    }
}
