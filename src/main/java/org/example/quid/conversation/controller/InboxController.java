package org.example.quid.conversation.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.quid.conversation.dto.ConversationSummaryResponse;
import org.example.quid.conversation.dto.MessageResponse;
import org.example.quid.conversation.dto.SendMessageRequest;
import org.example.quid.conversation.enums.ConversationStatus;
import org.example.quid.conversation.service.InboxService;
import org.example.quid.customer.service.MemoryService;
import org.example.quid.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class InboxController {

    private final InboxService inboxService;
    private final MemoryService memoryService;

    @GetMapping
    public Page<ConversationSummaryResponse> list(
            @RequestParam(required = false) ConversationStatus status,
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 20, sort = "updatedAt") Pageable pageable) {
        return inboxService.list(user.getWorkspace(), status, pageable);
    }

    @GetMapping("/{id}")
    public ConversationSummaryResponse get(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return inboxService.get(id, user.getWorkspace());
    }

    @GetMapping("/{id}/messages")
    public List<MessageResponse> getMessages(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return inboxService.getMessages(id, user.getWorkspace());
    }

    @PostMapping("/{id}/takeover")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void takeover(@PathVariable Long id, @AuthenticationPrincipal User user) {
        inboxService.takeover(id, user, user.getWorkspace());
    }

    @PostMapping("/{id}/resolve")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resolve(@PathVariable Long id, @AuthenticationPrincipal User user) {
        inboxService.resolve(id, user.getWorkspace()); // transaction commits here
        memoryService.summarize(id);                   // async — safe to call after commit
    }

    @PostMapping("/{id}/messages")
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse sendMessage(@PathVariable Long id,
                                       @Valid @RequestBody SendMessageRequest request,
                                       @AuthenticationPrincipal User user) {
        return inboxService.sendMessage(id, request.content(), user, user.getWorkspace());
    }
}
