package org.example.quid.user.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.quid.user.dto.StaffInviteRequest;
import org.example.quid.user.dto.StaffInviteResponse;
import org.example.quid.user.dto.StaffResponse;
import org.example.quid.user.entity.User;
import org.example.quid.user.service.StaffService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class StaffController {

    private final StaffService staffService;

    @PostMapping("/invite")
    @ResponseStatus(HttpStatus.CREATED)
    public StaffInviteResponse invite(@RequestBody @Valid StaffInviteRequest request,
                                      @AuthenticationPrincipal User currentUser) {
        return staffService.invite(request, currentUser);
    }

    @GetMapping
    public List<StaffResponse> list(@AuthenticationPrincipal User currentUser) {
        return staffService.list(currentUser);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable Long id,
                           @AuthenticationPrincipal User currentUser) {
        staffService.deactivate(id, currentUser);
    }
}
