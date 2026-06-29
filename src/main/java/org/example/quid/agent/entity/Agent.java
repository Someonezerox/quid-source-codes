package org.example.quid.agent.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.example.quid.workspace.entity.Workspace;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "agents", indexes = @Index(columnList = "workspace_id"))
@Getter
@Setter
public class Agent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String systemPrompt;

    /** OpenRouter model id; null falls back to the workspace default (ai.chat-model). */
    @Column
    private String model;

    @Column(nullable = false)
    private double confidenceThreshold = 0.75;

    @Column(nullable = false)
    private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
