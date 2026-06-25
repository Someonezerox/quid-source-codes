package org.example.quid.knowledge.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.example.quid.agent.entity.Agent;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "knowledge_bases")
@Getter
@Setter
public class KnowledgeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id", nullable = false)
    private Agent agent;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
