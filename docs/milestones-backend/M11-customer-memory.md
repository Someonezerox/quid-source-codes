# M11 — Customer Memory & Personalization

## Goal

The AI knows who it's talking to. Returning customers are recognized, their history is summarized and injected into context, their preferences are tracked, and the AI gradually improves its responses based on past interactions.

## What Gets Built

### 1. Customer Profile enrichment

Extend `Customer` with fields populated automatically from conversation history:

```
Customer (additions)
  - language          (detected from first message, e.g. "ru", "en")
  - notes             (TEXT — admin/agent can add manual notes)
  - totalConversations
  - lastSeenAt
```

### 2. Conversation Summary

After each conversation is resolved, generate a short AI summary of what was discussed and store it:

```
ConversationSummary
  - id
  - conversation_id   (one-to-one)
  - customer_id
  - content           (TEXT — 2-3 sentence AI-generated summary)
  - createdAt
```

Summaries are generated async after `InboxService.resolve()` via a new `MemoryService.summarize()` call.

### 3. Cross-conversation memory injection

When `AiRoutingService` builds the prompt, inject the customer's last N summaries alongside the KB context:

```
[system prompt]
[KB context — top-5 relevant entries]
[Customer memory — last 3 conversation summaries]
[current conversation history — last 10 messages]
```

The AI now knows: "This customer asked about refunds last week and was satisfied with the answer."

### 4. Per-customer preferences

```
CustomerPreference
  - id
  - customer_id
  - key               (e.g. "preferred_language", "communication_style", "product_interest")
  - value             (TEXT)
  - updatedAt
```

Preferences are extracted by the AI after each resolved conversation and upserted automatically. Also editable by agents via API.

### 5. AI learning from outcomes

Track which AI responses led to resolution vs escalation. After enough data, surface per-agent stats:

```
- resolutionRate      (conversations resolved by AI / total)
- avgMessagesBeforeResolution
- topEscalationReasons  (common topics where confidence was low)
```

These stats inform the agent owner which KB entries to add or improve.

## New Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/customers/{id}` | Customer profile with preferences and stats |
| GET | `/api/customers/{id}/summaries` | Past conversation summaries |
| PUT | `/api/customers/{id}/notes` | Agent adds/edits manual notes |
| GET | `/api/customers/{id}/preferences` | List preferences |
| PUT | `/api/customers/{id}/preferences/{key}` | Set preference manually |
| GET | `/api/agents/{id}/learning` | AI learning stats for an agent |

## Flow

```
Customer messages
  → AiRoutingService fetches last 3 summaries + preferences for this customer
  → Injects into prompt: KB context + customer memory + conversation history
  → AI responds with full context of who this person is

Conversation resolved
  → MemoryService.summarize() async:
      → calls AI to generate 2-3 sentence summary
      → saves ConversationSummary
      → calls AI to extract/update preferences
      → upserts CustomerPreference rows
```

## Key Rules

- Summary generation is async — resolution is not blocked by it
- Last 3 summaries injected (configurable via `ai.memory-depth`, default 3)
- Preferences are soft key-value — no fixed schema, AI decides what's worth storing
- Customer memory injection adds ~500 tokens to prompt — stay within model context limits
- All queries scoped to workspace — no cross-workspace customer data ever

## Out of Scope for MVP

- Vector-based customer memory search (summaries injected as raw text, not embedded)
- Automatic language switching in AI responses (detected but not acted on yet)
- Customer-facing memory opt-out / GDPR deletion (add when needed)
