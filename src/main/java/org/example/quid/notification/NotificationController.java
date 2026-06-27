package org.example.quid.notification;

import lombok.RequiredArgsConstructor;
import org.example.quid.user.entity.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final SseRegistry registry;

    @GetMapping(value = "/stream", produces = "text/event-stream")
    public SseEmitter stream(@AuthenticationPrincipal User currentUser) {
        SseEmitter emitter = new SseEmitter(300_000L); // 5-min timeout, client auto-reconnects
        registry.register(currentUser.getWorkspace().getId(), emitter);
        return emitter;
    }
}
