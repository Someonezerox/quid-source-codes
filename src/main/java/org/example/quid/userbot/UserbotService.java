package org.example.quid.userbot;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.quid.channel.dto.ChannelResponse;
import org.example.quid.channel.entity.Channel;
import org.example.quid.channel.enums.ChannelType;
import org.example.quid.channel.mapper.ChannelMapper;
import org.example.quid.channel.repository.ChannelRepository;
import org.example.quid.conversation.entity.Conversation;
import org.example.quid.conversation.enums.MessageRole;
import org.example.quid.conversation.service.ConversationService;
import org.example.quid.customer.entity.Customer;
import org.example.quid.customer.service.CustomerService;
import org.example.quid.notification.NotificationService;
import org.example.quid.telegram.dto.TelegramUser;
import org.example.quid.userbot.dto.UserbotDtos.InboundRequest;
import org.example.quid.userbot.dto.UserbotDtos.SignInRequest;
import org.example.quid.workspace.entity.Workspace;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserbotService {

    private final UserbotClient userbotClient;
    private final ChannelRepository channelRepository;
    private final ChannelMapper channelMapper;
    private final CustomerService customerService;
    private final ConversationService conversationService;
    private final NotificationService notificationService;

    public String sendCode(String phone) {
        return userbotClient.sendCode(phone);
    }

    /** Completes auth, then materializes a userbot Channel for the workspace. */
    public ChannelResponse signIn(SignInRequest req, Workspace workspace) {
        String sessionId = userbotClient.signIn(req.phone(), req.code(), req.phoneCodeHash(), req.password());
        Channel channel = new Channel();
        channel.setType(ChannelType.TELEGRAM_USERBOT);
        channel.setName(req.channelName() == null || req.channelName().isBlank() ? req.phone() : req.channelName());
        channel.setUserbotSessionId(sessionId);
        channel.setPhone(req.phone());
        channel.setActive(true);
        channel.setWorkspace(workspace);
        return channelMapper.toResponse(channelRepository.save(channel));
    }

    /** Ingest an inbound userbot message; returns the conversation id for async AI routing. */
    public Long inbound(InboundRequest req) {
        if (req.text() == null || req.text().isBlank()) return null;
        Channel channel = channelRepository.findByUserbotSessionId(req.sessionId())
                .filter(Channel::isActive)
                .orElse(null);
        if (channel == null) {
            log.warn("inbound for unknown/inactive session {}", req.sessionId());
            return null;
        }
        TelegramUser from = new TelegramUser(req.senderId(), req.senderName(), null, null);
        Customer customer = customerService.findOrCreate(from, channel.getWorkspace());
        Conversation conversation = conversationService.findOrCreateOpen(customer, channel);
        conversationService.addMessage(conversation, req.text(), MessageRole.CUSTOMER, null);
        notificationService.emit(channel.getWorkspace().getId(), "message",
                Map.of("conversationId", conversation.getId(), "content", req.text(), "role", "CUSTOMER"));
        return conversation.getId();
    }
}
