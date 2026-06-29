package org.example.quid.conversation.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.example.quid.agent.entity.Agent;
import org.example.quid.channel.entity.Channel;
import org.example.quid.conversation.enums.ConversationStatus;
import org.example.quid.customer.entity.Customer;
import org.example.quid.user.entity.User;
import org.example.quid.workspace.entity.Workspace;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "conversations", indexes = {
        @Index(columnList = "workspace_id, status"),
        @Index(columnList = "customer_id")
})
@Getter
@Setter
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "channel_id", nullable = false)
    private Channel channel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    // null = AI is handling; set when a human agent takes over
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_agent_id")
    private User assignedAgent;

    // which AI agent handled this conversation
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ai_agent_id")
    private Agent aiAgent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConversationStatus status = ConversationStatus.AI_HANDLING;

    /** Telegram chat the conversation lives in — group id for groups, user id for DMs. Replies go here. */
    private Long telegramChatId;

    private Double confidenceScore;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}
