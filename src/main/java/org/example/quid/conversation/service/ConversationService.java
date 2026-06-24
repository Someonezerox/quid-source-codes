package org.example.quid.conversation.service;

import lombok.RequiredArgsConstructor;
import org.example.quid.channel.entity.Channel;
import org.example.quid.conversation.entity.Conversation;
import org.example.quid.conversation.enums.ConversationStatus;
import org.example.quid.conversation.entity.Message;
import org.example.quid.conversation.enums.MessageRole;
import org.example.quid.conversation.repository.ConversationRepository;
import org.example.quid.conversation.repository.MessageRepository;
import org.example.quid.customer.entity.Customer;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;

    public Conversation findOrCreateOpen(Customer customer, Channel channel) {
        return conversationRepository
                .findTopByCustomerAndStatusNotOrderByCreatedAtDesc(customer, ConversationStatus.RESOLVED)
                .orElseGet(() -> {
                    Conversation conv = new Conversation();
                    conv.setCustomer(customer);
                    conv.setChannel(channel);
                    conv.setWorkspace(customer.getWorkspace());
                    return conversationRepository.save(conv);
                });
    }

    public Message addMessage(Conversation conversation, String text, MessageRole role, Long telegramMessageId) {
        Message msg = new Message();
        msg.setConversation(conversation);
        msg.setContent(text);
        msg.setRole(role);
        msg.setTelegramMessageId(telegramMessageId);
        return messageRepository.save(msg);
    }
}
