package org.example.quid.knowledge.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.quid.knowledge.dto.KnowledgeBaseRequest;
import org.example.quid.knowledge.dto.KnowledgeBaseResponse;
import org.example.quid.knowledge.dto.KnowledgeEntryRequest;
import org.example.quid.knowledge.dto.KnowledgeEntryResponse;
import org.example.quid.knowledge.service.KnowledgeService;
import org.example.quid.user.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/knowledge")
@RequiredArgsConstructor
public class KnowledgeController {

    private final KnowledgeService knowledgeService;

    @PostMapping("/bases")
    @ResponseStatus(HttpStatus.CREATED)
    public KnowledgeBaseResponse createBase(@Valid @RequestBody KnowledgeBaseRequest request,
                                            @AuthenticationPrincipal User user) {
        return knowledgeService.createBase(request, user.getWorkspace());
    }

    @GetMapping("/bases")
    public List<KnowledgeBaseResponse> listBases(@AuthenticationPrincipal User user) {
        return knowledgeService.listBases(user.getWorkspace());
    }

    @DeleteMapping("/bases/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBase(@PathVariable Long id, @AuthenticationPrincipal User user) {
        knowledgeService.deleteBase(id, user.getWorkspace());
    }

    @PostMapping("/bases/{kbId}/entries")
    @ResponseStatus(HttpStatus.CREATED)
    public KnowledgeEntryResponse createEntry(@PathVariable Long kbId,
                                              @Valid @RequestBody KnowledgeEntryRequest request,
                                              @AuthenticationPrincipal User user) {
        return knowledgeService.createEntry(kbId, request, user.getWorkspace());
    }

    @GetMapping("/bases/{kbId}/entries")
    public List<KnowledgeEntryResponse> listEntries(@PathVariable Long kbId,
                                                    @AuthenticationPrincipal User user) {
        return knowledgeService.listEntries(kbId, user.getWorkspace());
    }

    @PutMapping("/bases/{kbId}/entries/{entryId}")
    public KnowledgeEntryResponse updateEntry(@PathVariable Long kbId,
                                              @PathVariable Long entryId,
                                              @Valid @RequestBody KnowledgeEntryRequest request,
                                              @AuthenticationPrincipal User user) {
        return knowledgeService.updateEntry(kbId, entryId, request, user.getWorkspace());
    }

    @DeleteMapping("/bases/{kbId}/entries/{entryId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEntry(@PathVariable Long kbId, @PathVariable Long entryId,
                            @AuthenticationPrincipal User user) {
        knowledgeService.deleteEntry(kbId, entryId, user.getWorkspace());
    }
}
