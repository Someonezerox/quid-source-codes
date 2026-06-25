package org.example.quid.agent.mapper;

import org.example.quid.agent.dto.AgentDetailResponse;
import org.example.quid.agent.dto.AgentRequest;
import org.example.quid.agent.dto.AgentResponse;
import org.example.quid.agent.entity.Agent;
import org.example.quid.channel.dto.ChannelResponse;
import org.example.quid.knowledge.dto.KnowledgeBaseResponse;
import org.example.quid.workspace.entity.Workspace;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AgentMapper {

    /** Entity + computed stats → summary DTO used in list and single-item responses. */
    public AgentResponse toResponse(Agent agent, long totalConversations, Double avgConfidenceScore) {
        return new AgentResponse(
                agent.getId(),
                agent.getName(),
                agent.getDescription(),
                agent.getConfidenceThreshold(),
                agent.isActive(),
                agent.getCreatedAt(),
                totalConversations,
                avgConfidenceScore
        );
    }

    /** Entity + pre-fetched collections → detail DTO returned only on GET /{id}. */
    public AgentDetailResponse toDetailResponse(Agent agent, AgentResponse summary,
                                                List<KnowledgeBaseResponse> kbs,
                                                List<ChannelResponse> channels) {
        return new AgentDetailResponse(summary, agent.getSystemPrompt(), kbs, channels);
    }

    /** Request + workspace → new Agent entity ready to persist. */
    public Agent toEntity(AgentRequest request, Workspace workspace) {
        Agent agent = new Agent();
        agent.setWorkspace(workspace);
        update(agent, request);
        return agent;
    }

    /** Applies request fields onto an existing entity (used for PUT). */
    public void update(Agent agent, AgentRequest request) {
        agent.setName(request.name());
        agent.setDescription(request.description());
        agent.setSystemPrompt(request.systemPrompt());
        if (request.confidenceThreshold() != null) {
            agent.setConfidenceThreshold(request.confidenceThreshold());
        }
    }
}
