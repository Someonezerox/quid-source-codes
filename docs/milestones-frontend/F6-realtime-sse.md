# F6 — Real-Time SSE Integration

**Status:** TODO
**No prototype** — invisible plumbing behind the Inbox (F5) and the shell notification dot (F2).

## Objective
Wire the backend SSE stream so messages, status changes, and `needs_human` alerts propagate live without polling.

## What to build
- `hooks/useSseStream.ts` — singleton `EventSource` to `GET /api/notifications/stream?token=<jwt>`:
  - Parse `event: <type>` + `data: <json>`.
  - Auto-reconnect, exponential backoff 500ms → 30s cap.
  - Teardown on unmount/logout.
- Mounted **once in AppShell** (not per page). Handlers:
  - `needs_human` → invalidate `['conversations']` + bump notification dot.
  - `message` → invalidate `['messages', conversationId]`.
  - `assigned` → invalidate `['conversations']`.
  - `ping` → no-op keepalive (backend sends every 30s).
- `store/uiStore.ts` (or `notificationStore`) — unread count, reset on opening `/inbox`.

## Architectural decisions
- **Native `EventSource`, no library.** Only gap is auth headers (EventSource can't send them) → pass JWT as query param for this one endpoint; backend security already allows it.
- **Invalidate→refetch, not manual state splice** — server stays source of truth; no client divergence.
- **One connection per session** — multiple `EventSource` to the same URL silently duplicate events.

## Definition of Done
- New Telegram message lands in the open thread within ~1s.
- `needs_human` lights the sidebar notification dot.
- Connection recovers after a DevTools offline toggle.
- Exactly one stream open (verify in Network tab).
