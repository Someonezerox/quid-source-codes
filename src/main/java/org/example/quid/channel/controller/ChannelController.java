package org.example.quid.channel.controller;

import lombok.RequiredArgsConstructor;
import org.example.quid.channel.dto.ChannelResponse;
import org.example.quid.channel.service.ChannelService;
import org.example.quid.user.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/channels")
@RequiredArgsConstructor
public class ChannelController {

    private final ChannelService channelService;

    @GetMapping
    public List<ChannelResponse> findAll(@AuthenticationPrincipal User user) {
        return channelService.findAll(user.getWorkspace());
    }

    @GetMapping("/{id}")
    public ChannelResponse findById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return channelService.findById(id, user.getWorkspace());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable Long id, @AuthenticationPrincipal User user) {
        channelService.deactivate(id, user.getWorkspace());
    }
}
