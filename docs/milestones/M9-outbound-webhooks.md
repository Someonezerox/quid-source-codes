# M9 — Outbound Webhooks & Integrations

## Goal

Let workspace owners subscribe to QUID events via HTTP webhooks. Any external system (amoCRM, Google Sheets, HubSpot, Slack, Zapier, Make.com, n8n) reacts to QUID events without QUID needing to integrate with each one directly.

## Events

| Event | Fired when |
|---|---|
| `CONVERSATION_CREATED` | New customer message starts a conversation |
| `NEEDS_HUMAN` | AI confidence drops below threshold — human escalation |
| `AGENT_ASSIGNED` | Human agent takes over a conversation |
| `MESSAGE_SENT` | Any message added (customer, AI, or agent) |
| `CONVERSATION_RESOLVED` | Conversation marked resolved |

## Data Model

```
WebhookSubscription
  - id
  - workspace_id
  - url              (HTTPS endpoint to POST to)
  - events           (stored as comma-separated or JSON array)
  - secret           (optional HMAC-SHA256 signing secret)
  - active
  - createdAt
```

## API

```
POST   /api/webhooks          Subscribe (url + events)
GET    /api/webhooks          List subscriptions
DELETE /api/webhooks/{id}     Unsubscribe
```

## Delivery

- Fire async (virtual thread) — never block the main request
- POST with `Content-Type: application/json` body: `{ "event": "NEEDS_HUMAN", "workspaceId": 1, "conversationId": 42, ... }`
- Optional `X-QUID-Signature` header (HMAC-SHA256 of body with subscription secret) for payload verification
- Best-effort delivery — log failures, no retry queue in MVP

## Integration points

Hook into existing services after their state changes:
- `AiRoutingService` → `NEEDS_HUMAN`
- `InboxService.takeover()` → `AGENT_ASSIGNED`
- `InboxService.resolve()` → `CONVERSATION_RESOLVED`
- `TelegramWebhookHandler` → `CONVERSATION_CREATED`
- `InboxService.sendMessage()` → `MESSAGE_SENT`

## What this unlocks (no extra code)

- Zapier / Make.com / n8n — connects to 1000+ apps
- amoCRM — create lead on `CONVERSATION_CREATED`, add notes on messages
- Google Sheets — append row on each event
- Slack — notify a channel on `NEEDS_HUMAN`
- HubSpot, Bitrix24, Notion — via Zapier trigger

## Out of scope for MVP

- Retry queue with backoff
- Delivery logs / dashboard
- Direct native CRM integrations (amoCRM SDK, Sheets API) — use Zapier for now
