package org.example.quid.ai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.quid.agent.entity.Agent;
import org.example.quid.ai.client.ClaudeClient;
import org.example.quid.ai.dto.AiResponse;
import org.example.quid.ai.properties.AiProperties;
import org.example.quid.conversation.entity.Conversation;
import org.example.quid.conversation.entity.Message;
import org.example.quid.conversation.enums.ConversationStatus;
import org.example.quid.conversation.enums.MessageRole;
import org.example.quid.conversation.repository.ConversationRepository;
import org.example.quid.conversation.repository.MessageRepository;
import org.example.quid.conversation.service.ConversationService;
import org.example.quid.telegram.client.TelegramBotClient;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiRoutingService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final ConversationService conversationService;
    private final RagService ragService;
    private final ClaudeClient claudeClient;
    private final TelegramBotClient telegramBotClient;
    private final AiProperties props;

    @Async
    @Transactional
    public void process(Long conversationId) {
        Conversation conv = conversationRepository.findByIdWithDetails(conversationId).orElse(null);
        if (conv == null || conv.getStatus() != ConversationStatus.AI_HANDLING) return;

        Agent agent = conv.getChannel().getAssignedAgent();
        if (agent == null || !agent.isActive()) return;

        try {
            List<Message> history = messageRepository.findAllByConversationOrderByCreatedAtAsc(conv);
            if (history.isEmpty()) return;

            List<Message> window = history.size() > props.maxHistoryMessages()
                    ? history.subList(history.size() - props.maxHistoryMessages(), history.size())
                    : history;

            String lastMessage = history.get(history.size() - 1).getContent();
            String context = ragService.buildContext(lastMessage, agent);

            AiResponse aiResponse = claudeClient.chat(agent.getSystemPrompt(), context, window);
            conv.setConfidenceScore(aiResponse.confidence());
            conv.setAiAgent(agent);

            if (aiResponse.confidence() >= agent.getConfidenceThreshold()) {
                conversationService.addMessage(conv, aiResponse.reply(), MessageRole.AI, null);
                telegramBotClient.sendMessage(
                        conv.getChannel().getBotToken(),
                        conv.getCustomer().getTelegramId(),
                        aiResponse.reply()
                );
            } else {
                conv.setStatus(ConversationStatus.NEEDS_HUMAN);
                log.info("Conversation {} routed to human (confidence={})", conversationId, aiResponse.confidence());
            }
        } catch (Exception e) {
            log.error("AI routing failed for conversation {}, escalating to human", conversationId, e);
            conv.setStatus(ConversationStatus.NEEDS_HUMAN);
        }
    }
}
