package org.example.quid.agent.dto;

import jakarta.validation.constraints.NotNull;

public record AgentChannelRequest(@NotNull Long agentId) {}
