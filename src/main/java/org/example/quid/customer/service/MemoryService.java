package org.example.quid.customer.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.quid.ai.client.ChatClient;
import org.example.quid.ai.dto.MemoryExtraction;
import org.example.quid.ai.properties.AiProperties;
import org.example.quid.conversation.entity.Conversation;
import org.example.quid.conversation.entity.Message;
import org.example.quid.conversation.repository.ConversationRepository;
import org.example.quid.conversation.repository.MessageRepository;
import org.example.quid.customer.entity.ConversationSummary;
import org.example.quid.customer.entity.Customer;
import org.example.quid.customer.entity.CustomerPreference;
import org.example.quid.customer.repository.ConversationSummaryRepository;
import org.example.quid.customer.repository.CustomerPreferenceRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemoryService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final ConversationSummaryRepository summaryRepository;
    private final CustomerPreferenceRepository preferenceRepository;
    private final ChatClient chatClient;
    private final AiProperties props;

    @Async
    @Transactional
    public void summarize(Long conversationId) {
        Conversation conv = conversationRepository.findByIdWithDetails(conversationId).orElse(null);
        if (conv == null) return;

        List<Message> messages = messageRepository.findAllByConversationOrderByCreatedAtAsc(conv);
        if (messages.isEmpty()) return;

        MemoryExtraction extraction = chatClient.summarize(messages);

        ConversationSummary summary = new ConversationSummary();
        summary.setConversation(conv);
        summary.setCustomer(conv.getCustomer());
        summary.setContent(extraction.summary());
        summaryRepository.save(summary);

        Customer customer = conv.getCustomer();
        extraction.preferences().forEach((key, value) -> {
            CustomerPreference pref = preferenceRepository.findByCustomerAndKey(customer, key)
                    .orElseGet(() -> {
                        CustomerPreference p = new CustomerPreference();
                        p.setCustomer(customer);
                        p.setKey(key);
                        return p;
                    });
            pref.setValue(value);
            preferenceRepository.save(pref);
        });

        log.debug("Memory saved for conversation {}, {} preferences extracted",
                conversationId, extraction.preferences().size());
    }

    @Transactional(readOnly = true)
    public String buildContext(Customer customer) {
        List<ConversationSummary> summaries = summaryRepository.findByCustomerOrderByCreatedAtDesc(
                customer, PageRequest.of(0, props.memoryDepth()));
        List<CustomerPreference> prefs = preferenceRepository.findAllByCustomer(customer);

        StringBuilder sb = new StringBuilder();

        if (!prefs.isEmpty()) {
            sb.append("=== Customer Preferences ===\n");
            prefs.forEach(p -> sb.append(p.getKey()).append(": ").append(p.getValue()).append("\n"));
            sb.append("\n");
        }

        if (!summaries.isEmpty()) {
            sb.append("=== Customer Conversation History ===\n");
            summaries.forEach(s -> sb.append("(")
                    .append(s.getCreatedAt().toString().substring(0, 10))
                    .append(") ")
                    .append(s.getContent())
                    .append("\n"));
        }

        return sb.toString().trim();
    }
}
