# M8 — Real-time Notifications (SSE)

**Status:** TODO

## Goal
Human agents are notified instantly when a conversation needs attention — no polling required.

## Approach: Server-Sent Events
SSE over WebSocket: unidirectional, works through proxies, zero extra dependencies, natively supported by Spring MVC via `SseEmitter`.

## Flow
```
Agent connects → GET /api/notifications/stream (long-lived SSE connection)
  → SseRegistry holds one SseEmitter per connected agent (keyed by workspaceId)
  → AiRoutingService sets NEEDS_HUMAN → emits event to all workspace agents
  → Agent takes over → emits "assigned" event
  → New message in agent's conversation → emits "message" event
  → Every 30s → emits "ping" to keep connection alive
  → Client auto-reconnects on disconnect (SSE spec, built into browser EventSource)
```

## Events

| Event | Payload | Emitted by |
|-------|---------|------------|
| `needs_human` | `{conversationId, customerId, customerName}` | `AiRoutingService` after status flip |
| `assigned` | `{conversationId, agentId}` | `InboxService.takeover()` |
| `message` | `{conversationId, content, role}` | `InboxService.sendMessage()` + customer messages |
| `ping` | `{}` | Scheduled every 30s |

## Files to Create
- `notification/SseRegistry.java` — `ConcurrentHashMap<Long, CopyOnWriteArrayList<SseEmitter>>` keyed by workspaceId; handles emitter cleanup on timeout/error/completion
- `notification/NotificationService.java` — `emit(Long workspaceId, String event, Object payload)`; serializes payload to JSON; swallows per-emitter send errors (dead connection)
- `notification/NotificationController.java` — `GET /api/notifications/stream` returns `SseEmitter` with 5-min timeout (client reconnects)

## Integration Points
- `AiRoutingService` injects `NotificationService` → emits `needs_human` after setting `NEEDS_HUMAN`
- `InboxService.takeover()` → emits `assigned`
- `InboxService.sendMessage()` → emits `message` to workspace
- `TelegramWebhookService` → emits `message` when customer message arrives

## Key Rules
- Registry is in-memory: `// ponytail: in-memory, use Redis pub/sub for multi-node deployments`
- SSE endpoint is workspace-scoped — agent only receives events for their workspace
- Emitters removed from registry on `onTimeout`, `onError`, `onCompletion` callbacks
- No Spring WebSocket, no STOMP, no Kafka — just `SseEmitter`
- Ping scheduled via `@Scheduled` in `NotificationService` — requires `@EnableScheduling` on main class
