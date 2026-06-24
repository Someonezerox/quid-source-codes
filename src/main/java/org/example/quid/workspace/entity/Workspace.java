package org.example.quid.workspace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "workspaces")
@Getter
@Setter
public class Workspace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, columnDefinition = "DOUBLE PRECISION DEFAULT 0.75")
    private double confidenceThreshold = 0.75;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
