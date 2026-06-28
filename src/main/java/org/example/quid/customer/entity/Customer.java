package org.example.quid.customer.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.example.quid.customer.enums.CustomerStatus;
import org.example.quid.workspace.entity.Workspace;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "customers",
        uniqueConstraints = @UniqueConstraint(columnNames = {"telegram_id", "workspace_id"}))
@Getter
@Setter
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "telegram_id", nullable = false)
    private Long telegramId;

    private String username;
    private String firstName;
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CustomerStatus status = CustomerStatus.ACTIVE;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private Instant lastSeenAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
