package org.example.quid.agent.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.quid.agent.dto.AgentDetailResponse;
import org.example.quid.agent.dto.AgentLearningResponse;
import org.example.quid.agent.dto.AgentRequest;
import org.example.quid.agent.dto.AgentResponse;
import org.example.quid.agent.service.AgentService;
import org.example.quid.user.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agents")
@RequiredArgsConstructor
public class AgentController {

    private final AgentService agentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AgentResponse create(@Valid @RequestBody AgentRequest request,
                                @AuthenticationPrincipal User user) {
        return agentService.create(request, user.getWorkspace());
    }

    @GetMapping
    public List<AgentResponse> list(@AuthenticationPrincipal User user) {
        return agentService.list(user.getWorkspace());
    }

    @GetMapping("/{id}")
    public AgentDetailResponse get(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return agentService.get(id, user.getWorkspace());
    }

    @PutMapping("/{id}")
    public AgentResponse update(@PathVariable Long id,
                                @Valid @RequestBody AgentRequest request,
                                @AuthenticationPrincipal User user) {
        return agentService.update(id, request, user.getWorkspace());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable Long id, @AuthenticationPrincipal User user) {
        agentService.deactivate(id, user.getWorkspace());
    }

    @PutMapping("/{id}/channels/{channelId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void assignToChannel(@PathVariable Long id,
                                @PathVariable Long channelId,
                                @AuthenticationPrincipal User user) {
        agentService.assignToChannel(channelId, id, user.getWorkspace());
    }

    @DeleteMapping("/{id}/channels/{channelId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unassignFromChannel(@PathVariable Long id,
                                    @PathVariable Long channelId,
                                    @AuthenticationPrincipal User user) {
        agentService.unassignFromChannel(channelId, user.getWorkspace());
    }

    @GetMapping("/{id}/learning")
    public AgentLearningResponse getLearning(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return agentService.getLearning(id, user.getWorkspace());
    }
}
