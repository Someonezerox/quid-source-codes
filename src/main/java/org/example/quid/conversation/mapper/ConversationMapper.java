package org.example.quid.conversation.mapper;

import org.example.quid.conversation.dto.ConversationSummaryResponse;
import org.example.quid.conversation.dto.MessageResponse;
import org.example.quid.conversation.entity.Conversation;
import org.example.quid.conversation.entity.Message;
import org.springframework.stereotype.Component;

@Component
public class ConversationMapper {

    public ConversationSummaryResponse toSummaryResponse(Conversation conversation) {
        return new ConversationSummaryResponse(
                conversation.getId(),
                conversation.getStatus(),
                conversation.getCustomer().getFirstName(),
                conversation.getCustomer().getLastName(),
                conversation.getConfidenceScore(),
                conversation.getUpdatedAt()
        );
    }

    public MessageResponse toMessageResponse(Message message) {
        return new MessageResponse(
                message.getId(),
                message.getRole(),
                message.getContent(),
                message.getCreatedAt()
        );
    }
}
