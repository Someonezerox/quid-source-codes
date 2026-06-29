package org.example.quid.channel.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.example.quid.agent.entity.Agent;
import org.example.quid.channel.enums.ChannelType;
import org.example.quid.workspace.entity.Workspace;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "channels")
@Getter
@Setter
public class Channel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChannelType type;

    /** Bot API token (TELEGRAM channels). Null for userbot channels. */
    private String botToken;

    /** MTProto session id from the userbot sidecar (TELEGRAM_USERBOT channels). */
    private String userbotSessionId;

    /** Phone number backing a userbot channel. */
    private String phone;

    private String webhookUrl;

    @Column(nullable = false)
    private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_agent_id")
    private Agent assignedAgent;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
