package org.example.quid.customer.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.quid.customer.dto.CustomerNotesRequest;
import org.example.quid.customer.dto.CustomerProfileResponse;
import org.example.quid.customer.dto.MemorySummaryResponse;
import org.example.quid.customer.dto.PreferenceRequest;
import org.example.quid.customer.dto.PreferenceResponse;
import org.example.quid.customer.service.CustomerProfileService;
import org.example.quid.user.entity.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerProfileService customerProfileService;

    @GetMapping("/{id}")
    public CustomerProfileResponse get(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return customerProfileService.get(id, user.getWorkspace());
    }

    @GetMapping("/{id}/summaries")
    public List<MemorySummaryResponse> getSummaries(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return customerProfileService.getSummaries(id, user.getWorkspace());
    }

    @PutMapping("/{id}/notes")
    public CustomerProfileResponse updateNotes(@PathVariable Long id,
                                               @RequestBody @Valid CustomerNotesRequest request,
                                               @AuthenticationPrincipal User user) {
        return customerProfileService.updateNotes(id, request.notes(), user.getWorkspace());
    }

    @GetMapping("/{id}/preferences")
    public List<PreferenceResponse> getPreferences(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return customerProfileService.getPreferences(id, user.getWorkspace());
    }

    @PutMapping("/{id}/preferences/{key}")
    public PreferenceResponse setPreference(@PathVariable Long id,
                                            @PathVariable String key,
                                            @RequestBody @Valid PreferenceRequest request,
                                            @AuthenticationPrincipal User user) {
        return customerProfileService.setPreference(id, key, request.value(), user.getWorkspace());
    }
}
