package org.example.quid.agent.dto;

import org.example.quid.channel.dto.ChannelResponse;
import org.example.quid.knowledge.dto.KnowledgeBaseResponse;

import java.util.List;

public record AgentDetailResponse(
        AgentResponse agent,
        String systemPrompt,
        List<KnowledgeBaseResponse> knowledgeBases,
        List<ChannelResponse> assignedChannels
) {}
