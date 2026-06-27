package org.example.quid.conversation.service;

import lombok.RequiredArgsConstructor;
import org.example.quid.conversation.dto.ConversationSummaryResponse;
import org.example.quid.conversation.dto.MessageResponse;
import org.example.quid.conversation.entity.Conversation;
import org.example.quid.conversation.enums.ConversationStatus;
import org.example.quid.conversation.enums.MessageRole;
import org.example.quid.conversation.mapper.ConversationMapper;
import org.example.quid.conversation.repository.ConversationRepository;
import org.example.quid.conversation.repository.MessageRepository;
import org.example.quid.customer.enums.CustomerStatus;
import org.example.quid.exception.ResourceNotFoundException;
import org.example.quid.notification.NotificationService;
import org.example.quid.user.entity.User;
import org.example.quid.workspace.entity.Workspace;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class InboxService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final ConversationService conversationService;
    private final ConversationMapper conversationMapper;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public Page<ConversationSummaryResponse> list(Workspace workspace, ConversationStatus status, Pageable pageable) {
        if (status != null) {
            return conversationRepository.findAllByWorkspaceAndStatus(workspace, status, pageable)
                    .map(conversationMapper::toSummaryResponse);
        }
        return conversationRepository.findAllByWorkspace(workspace, pageable)
                .map(conversationMapper::toSummaryResponse);
    }

    @Transactional(readOnly = true)
    public ConversationSummaryResponse get(Long conversationId, Workspace workspace) {
        return conversationMapper.toSummaryResponse(getOrThrow(conversationId, workspace));
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getMessages(Long conversationId, Workspace workspace) {
        return messageRepository.findAllByConversationOrderByCreatedAtAsc(getOrThrow(conversationId, workspace))
                .stream()
                .map(conversationMapper::toMessageResponse)
                .toList();
    }

    public void takeover(Long conversationId, User agent, Workspace workspace) {
        Conversation conv = getOrThrow(conversationId, workspace);
        conv.setStatus(ConversationStatus.NEEDS_HUMAN);
        conv.setAssignedAgent(agent);
        notificationService.emit(workspace.getId(), "assigned",
                Map.of("conversationId", conv.getId(), "agentId", agent.getId()));
    }

    public void resolve(Long conversationId, Workspace workspace) {
        Conversation conv = getOrThrow(conversationId, workspace);
        conv.setStatus(ConversationStatus.RESOLVED);
        conv.getCustomer().setStatus(CustomerStatus.RESOLVED);
    }

    public MessageResponse sendMessage(Long conversationId, String content, User agent, Workspace workspace) {
        Conversation conv = getOrThrow(conversationId, workspace);
        MessageResponse response = conversationMapper.toMessageResponse(
                conversationService.addMessage(conv, content, MessageRole.AGENT, null));
        notificationService.emit(workspace.getId(), "message",
                Map.of("conversationId", conversationId, "content", content, "role", "AGENT"));
        return response;
    }

    private Conversation getOrThrow(Long id, Workspace workspace) {
        return conversationRepository.findByIdAndWorkspace(id, workspace)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
    }
}
