package org.example.quid.agent.service;

import lombok.RequiredArgsConstructor;
import org.example.quid.agent.dto.AgentDetailResponse;
import org.example.quid.agent.dto.AgentRequest;
import org.example.quid.agent.dto.AgentResponse;
import org.example.quid.agent.entity.Agent;
import org.example.quid.agent.repository.AgentRepository;
import org.example.quid.channel.dto.ChannelResponse;
import org.example.quid.channel.entity.Channel;
import org.example.quid.channel.repository.ChannelRepository;
import org.example.quid.conversation.repository.ConversationRepository;
import org.example.quid.exception.ResourceNotFoundException;
import org.example.quid.knowledge.dto.KnowledgeBaseResponse;
import org.example.quid.knowledge.repository.KnowledgeBaseRepository;
import org.example.quid.workspace.entity.Workspace;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AgentService {

    private final AgentRepository agentRepository;
    private final ChannelRepository channelRepository;
    private final KnowledgeBaseRepository kbRepository;
    private final ConversationRepository conversationRepository;

    public AgentResponse create(AgentRequest request, Workspace workspace) {
        Agent agent = new Agent();
        applyRequest(agent, request);
        agent.setWorkspace(workspace);
        Agent saved = agentRepository.save(agent);
        return AgentResponse.from(saved, 0, null);
    }

    @Transactional(readOnly = true)
    public List<AgentResponse> list(Workspace workspace) {
        return agentRepository.findAllByWorkspace(workspace).stream()
                .map(a -> AgentResponse.from(a,
                        conversationRepository.countByAiAgent_Id(a.getId()),
                        conversationRepository.avgConfidenceByAiAgentId(a.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public AgentDetailResponse get(Long id, Workspace workspace) {
        Agent agent = getOrThrow(id, workspace);

        AgentResponse summary = AgentResponse.from(agent,
                conversationRepository.countByAiAgent_Id(agent.getId()),
                conversationRepository.avgConfidenceByAiAgentId(agent.getId()));

        List<KnowledgeBaseResponse> kbs = kbRepository.findAllByAgent(agent).stream()
                .map(KnowledgeBaseResponse::from)
                .toList();

        List<ChannelResponse> channels = channelRepository.findAllByAssignedAgent(agent).stream()
                .map(ChannelResponse::from)
                .toList();

        return new AgentDetailResponse(summary, agent.getSystemPrompt(), kbs, channels);
    }

    public AgentResponse update(Long id, AgentRequest request, Workspace workspace) {
        Agent agent = getOrThrow(id, workspace);
        applyRequest(agent, request);
        return AgentResponse.from(agent,
                conversationRepository.countByAiAgent_Id(agent.getId()),
                conversationRepository.avgConfidenceByAiAgentId(agent.getId()));
    }

    public void deactivate(Long id, Workspace workspace) {
        getOrThrow(id, workspace).setActive(false);
    }

    public void assignToChannel(Long channelId, Long agentId, Workspace workspace) {
        Channel channel = channelRepository.findByIdAndWorkspace(channelId, workspace)
                .orElseThrow(() -> new ResourceNotFoundException("Channel not found"));
        Agent agent = getOrThrow(agentId, workspace);
        channel.setAssignedAgent(agent);
    }

    public void unassignFromChannel(Long channelId, Workspace workspace) {
        Channel channel = channelRepository.findByIdAndWorkspace(channelId, workspace)
                .orElseThrow(() -> new ResourceNotFoundException("Channel not found"));
        channel.setAssignedAgent(null);
    }

    public Agent getOrThrow(Long id, Workspace workspace) {
        return agentRepository.findByIdAndWorkspace(id, workspace)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));
    }

    private void applyRequest(Agent agent, AgentRequest request) {
        agent.setName(request.name());
        agent.setDescription(request.description());
        agent.setSystemPrompt(request.systemPrompt());
        if (request.confidenceThreshold() != null) {
            agent.setConfidenceThreshold(request.confidenceThreshold());
        }
    }
}
