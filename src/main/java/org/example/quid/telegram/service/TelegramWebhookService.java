package org.example.quid.telegram.service;

import lombok.RequiredArgsConstructor;
import org.example.quid.channel.entity.Channel;
import org.example.quid.channel.repository.ChannelRepository;
import org.example.quid.conversation.entity.Conversation;
import org.example.quid.conversation.enums.MessageRole;
import org.example.quid.conversation.service.ConversationService;
import org.example.quid.customer.entity.Customer;
import org.example.quid.customer.service.CustomerService;
import org.example.quid.exception.ResourceNotFoundException;
import org.example.quid.telegram.dto.TelegramUpdate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class TelegramWebhookService {

    private final ChannelRepository channelRepository;
    private final CustomerService customerService;
    private final ConversationService conversationService;

    public Long handle(Long channelId, TelegramUpdate update) {
        if (update.message() == null || update.message().text() == null) return null;

        Channel channel = channelRepository.findById(channelId)
                .filter(Channel::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Channel not found"));

        Customer customer = customerService.findOrCreate(update.message().from(), channel.getWorkspace());
        Conversation conversation = conversationService.findOrCreateOpen(customer, channel);
        conversationService.addMessage(conversation, update.message().text(),
                MessageRole.CUSTOMER, update.message().messageId());
        return conversation.getId();
    }
}
