package org.example.quid.notification;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SseRegistry registry;
    private final ObjectMapper objectMapper;

    public void emit(Long workspaceId, String event, Object payload) {
        List<SseEmitter> emitters = registry.get(workspaceId);
        if (emitters.isEmpty()) return;

        String json;
        try {
            json = objectMapper.writeValueAsString(payload);
        } catch (Exception e) {
            log.error("Failed to serialize SSE payload for event '{}'", event, e);
            return;
        }

        var sseEvent = SseEmitter.event().name(event).data(json);
        emitters.removeIf(emitter -> {
            try {
                emitter.send(sseEvent);
                return false;
            } catch (Exception e) {
                return true; // dead connection — drop it
            }
        });
    }

    @Scheduled(fixedDelay = 30_000)
    public void ping() {
        var pingEvent = SseEmitter.event().name("ping").data("{}");
        registry.allLists().forEach(list ->
                list.removeIf(emitter -> {
                    try {
                        emitter.send(pingEvent);
                        return false;
                    } catch (Exception e) {
                        return true;
                    }
                })
        );
    }
}
