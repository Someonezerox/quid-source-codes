package org.example.quid.agent.service;

import lombok.RequiredArgsConstructor;
import org.example.quid.agent.dto.AgentDetailResponse;
import org.example.quid.agent.dto.AgentLearningResponse;
import org.example.quid.agent.dto.AgentRequest;
import org.example.quid.agent.dto.AgentResponse;
import org.example.quid.agent.entity.Agent;
import org.example.quid.agent.mapper.AgentMapper;
import org.example.quid.agent.repository.AgentRepository;
import org.example.quid.channel.dto.ChannelResponse;
import org.example.quid.channel.entity.Channel;
import org.example.quid.channel.mapper.ChannelMapper;
import org.example.quid.channel.repository.ChannelRepository;
import org.example.quid.conversation.enums.ConversationStatus;
import org.example.quid.conversation.repository.ConversationRepository;
import org.example.quid.exception.ResourceNotFoundException;
import org.example.quid.knowledge.dto.KnowledgeBaseResponse;
import org.example.quid.knowledge.mapper.KnowledgeMapper;
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
    private final AgentMapper agentMapper;
    private final ChannelMapper channelMapper;
    private final KnowledgeMapper knowledgeMapper;

    public AgentResponse create(AgentRequest request, Workspace workspace) {
        Agent saved = agentRepository.save(agentMapper.toEntity(request, workspace));
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AgentResponse> list(Workspace workspace) {
        return agentRepository.findAllByWorkspace(workspace).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AgentDetailResponse get(Long id, Workspace workspace) {
        Agent agent = getOrThrow(id, workspace);

        List<KnowledgeBaseResponse> kbs = kbRepository.findAllByAgent(agent).stream()
                .map(knowledgeMapper::toBaseResponse)
                .toList();

        List<ChannelResponse> channels = channelRepository.findAllByAssignedAgent(agent).stream()
                .map(channelMapper::toResponse)
                .toList();

        return agentMapper.toDetailResponse(agent, toResponse(agent), kbs, channels);
    }

    public AgentResponse update(Long id, AgentRequest request, Workspace workspace) {
        Agent agent = getOrThrow(id, workspace);
        agentMapper.update(agent, request);
        return toResponse(agent);
    }

    public void deactivate(Long id, Workspace workspace) {
        getOrThrow(id, workspace).setActive(false);
    }

    public void assignToChannel(Long channelId, Long agentId, Workspace workspace) {
        Channel channel = channelRepository.findByIdAndWorkspace(channelId, workspace)
                .orElseThrow(() -> new ResourceNotFoundException("Channel not found"));
        channel.setAssignedAgent(getOrThrow(agentId, workspace));
    }

    public void unassignFromChannel(Long channelId, Workspace workspace) {
        channelRepository.findByIdAndWorkspace(channelId, workspace)
                .orElseThrow(() -> new ResourceNotFoundException("Channel not found"))
                .setAssignedAgent(null);
    }

    public Agent getOrThrow(Long id, Workspace workspace) {
        return agentRepository.findByIdAndWorkspace(id, workspace)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));
    }

    @Transactional(readOnly = true)
    public AgentLearningResponse getLearning(Long id, Workspace workspace) {
        Agent agent = getOrThrow(id, workspace);
        long total = conversationRepository.countByAiAgent_Id(agent.getId());
        long resolved = conversationRepository.countByAiAgent_IdAndStatus(agent.getId(), ConversationStatus.RESOLVED);
        double rate = total == 0 ? 0.0 : (double) resolved / total;
        return new AgentLearningResponse(total, resolved, rate,
                conversationRepository.avgConfidenceByAiAgentId(agent.getId()));
    }

    private AgentResponse toResponse(Agent agent) {
        return agentMapper.toResponse(
                agent,
                conversationRepository.countByAiAgent_Id(agent.getId()),
                conversationRepository.avgConfidenceByAiAgentId(agent.getId())
        );
    }
}
