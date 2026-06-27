package org.example.quid.notification;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Collection;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class SseRegistry {

    // ponytail: in-memory, use Redis pub/sub for multi-node deployments
    private final ConcurrentHashMap<Long, CopyOnWriteArrayList<SseEmitter>> store = new ConcurrentHashMap<>();

    public void register(Long workspaceId, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> list = store.computeIfAbsent(workspaceId, k -> new CopyOnWriteArrayList<>());
        list.add(emitter);
        emitter.onTimeout(() -> list.remove(emitter));
        emitter.onError(e -> list.remove(emitter));
        emitter.onCompletion(() -> list.remove(emitter));
    }

    public List<SseEmitter> get(Long workspaceId) {
        return store.getOrDefault(workspaceId, new CopyOnWriteArrayList<>());
    }

    public Collection<CopyOnWriteArrayList<SseEmitter>> allLists() {
        return store.values();
    }
}
