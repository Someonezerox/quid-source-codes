# M4 — Inbox API

**Status:** DONE

## Goal
Give the frontend and agents a full read/write API over conversations and messages. Includes the agent "take over" mechanism.

## Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/conversations` | Paginated list (filter by status, assignedAgent) |
| GET | `/api/conversations/{id}` | Single conversation with messages |
| POST | `/api/conversations/{id}/takeover` | Agent claims conversation → status=NEEDS_HUMAN, assignedAgent=me |
| POST | `/api/conversations/{id}/resolve` | Mark resolved |
| POST | `/api/conversations/{id}/messages` | Agent sends a message (role=AGENT) |
| GET | `/api/conversations/{id}/messages` | Paginated message history |

## Files to Create
- `conversation/dto/ConversationSummaryResponse.java` — for list (no messages)
- `conversation/dto/ConversationDetailResponse.java` — includes messages
- `conversation/dto/MessageResponse.java`
- `conversation/dto/SendMessageRequest.java`
- `conversation/service/InboxService.java`
- `conversation/controller/InboxController.java`

## Key Rules
- All queries scoped to `workspace` — use `JOIN FETCH` on `customer` and `assignedAgent` to prevent N+1
- Conversation list must be **paginated** (`Pageable`) — inbox can have 10k+ conversations
- `takeover`: only ADMIN or AGENT role; set `assignedAgent` = current user, `status` = NEEDS_HUMAN
- `resolve`: set `status` = RESOLVED, `customer.status` = RESOLVED
- Agent message: persist `Message(role=AGENT)`, then send via Telegram Bot API (async, non-blocking)
- Messages list: paginate oldest-first (chat UX), default page size 50
