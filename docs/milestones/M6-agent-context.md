# M6 — Agent Context Management

**Status:** TODO

## Goal
Give agents everything they need to handle a customer the moment they take over. An agent should never ask "who is this person?" — the system answers that before they have to.

## What Agents Need to Know
When an agent opens a conversation they must immediately see:
- **Who** — customer identity (name, Telegram handle, status)
- **History** — past conversations with outcomes (resolved / escalated) and message counts
- **Notes** — agent-written observations about this customer (persisted across conversations)
- **Summary** — AI-generated summary of the current conversation so far, so agent doesn't read every message

## Flow
```
Agent opens conversation
  → GET /api/conversations/{id}/context
  → returns: customer profile + past conversation stubs + customer notes + AI summary of current thread
```

## New Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/conversations/{id}/context` | Full agent context for a conversation |
| GET | `/api/customers/{id}/history` | Paginated past conversations for a customer |
| POST | `/api/customers/{id}/notes` | Add a note to a customer profile |
| GET | `/api/customers/{id}/notes` | List notes for a customer |
| DELETE | `/api/customers/{id}/notes/{noteId}` | Delete a note |

## Files to Create
- `customer/entity/CustomerNote.java` — `@Entity`: id, customer (FK), author (FK → User), content, createdAt
- `customer/repository/CustomerNoteRepository.java`
- `customer/dto/CustomerNoteRequest.java` — `@NotBlank String content`
- `customer/dto/CustomerNoteResponse.java` — includes authorName, createdAt
- `customer/dto/CustomerContextResponse.java` — full profile + notes + conversation history stubs
- `customer/service/CustomerContextService.java` — assembles context, calls AI for summary
- `customer/controller/CustomerController.java` — notes CRUD + history
- `conversation/dto/ConversationContextResponse.java` — wraps CustomerContextResponse + AI summary + current messages

## AI Conversation Summary
- Called lazily when agent requests context (not on every message)
- Prompt: "Summarize this customer support conversation in 3 sentences for the agent taking over."
- Cached on `Conversation.agentSummary` (new nullable column) — regenerated only if conversation has new messages since last summary
- Uses `ClaudeClient` (already built)

## Key Rules
- Workspace-scoped at every query — never leak cross-workspace customer data
- Notes are visible to all agents in the same workspace
- History stubs only: id, status, messageCount, createdAt — no full message payloads in the context response (agent fetches those separately if needed)
- Summary generation is synchronous here (agent is waiting for it) but fast — haiku model, short prompt
