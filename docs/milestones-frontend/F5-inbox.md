# F5 — Inbox (Conversation List + Thread)

**Status:** TODO
**Port from:** `frontend/prototype/QUID Inbox.dc.html`.

## Objective
The core agent workspace. Port the three-pane layout (rail · conversation list · thread) and wire it to live data. Highest-traffic page.

## What the prototype shows
- **List pane (452px):** "Inbox / 6 open", search box, filter tabs (`All`, `Support Bot`, `Billing Bot`), conversation rows with avatar, name, time, preview, status dot, "AI confidence 96%".
- **Thread pane:** customer header (name, @handle, status badge, "AI handling" toggle, kebab), date divider, message bubbles (inbound left `--raised`; outbound AI right with accent tint + per-message confidence bar), reply input with attach + accent Send.

## Design → API adaptation
Prototype data is the inline `raw[]` array — replace with API via adapters:

| Prototype field | DTO source |
|---|---|
| `name`, `initials` | `customerName` → `initials()` |
| `preview` | `lastMessagePreview` |
| `time` | `lastMessageAt` → `relativeTime()` |
| `status` / `statusColor` | `status` enum → `STATUS_LABEL/COLOR` |
| `conf` / `confColor` | `confidenceScore` → pill % + color vs agent threshold |
| `avatarBg` | deterministic gradient from `customerId` |
| filter tabs | map to status filter **and/or** assigned-agent filter — confirm semantics (prototype names bots, backend filters by status) |

Bubble side/color: `role === CUSTOMER` → left `--raised`; `AI` → right accent tint + confidence bar; `AGENT` → right, accent solid.

## Code structure
- `types/inbox.ts` — `ConversationSummaryResponse`, `MessageResponse`.
- `features/inbox/adapters.ts` — `toConversationVM`, `toMessageVM` (all color/initials/time logic here).
- `features/inbox/hooks.ts` — `useConversations(filter)`, `useMessages(id)`, `useSendMessage(id)`.
- `features/inbox/components/` — `ConversationList`, `ConversationRow`, `Thread`, `MessageBubble`, `ReplyBar`, `ThreadHeader`.
- `InboxPage.tsx` — selected id in URL (`/inbox/:id`).

## Behavior
- Virtualize the conversation list (`@tanstack/react-virtual`, fixed 72px rows) — can be thousands.
- Optimistic send (`useMutation onMutate` appends, `onError` rolls back).
- SSE (F6) invalidates `['conversations']` / `['messages', id]`.
- Load last N messages (`ai.maxHistoryMessages`); scroll-up pagination deferred (YAGNI).

## API contract
- `GET /api/inbox?status=&page=&size=` → `Page<ConversationSummaryResponse>`
- `GET /api/inbox/{id}/messages` → `List<MessageResponse>`
- `POST /api/inbox/{id}/messages` → `MessageResponse`

## Definition of Done
- Visual match to prototype, both themes.
- Filters work; selecting a row loads the thread.
- Agent reply appears instantly (optimistic); live updates via SSE.
