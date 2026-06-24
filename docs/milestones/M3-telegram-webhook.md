# M3 — Telegram Webhook Receiver

**Status:** DONE

## Goal
Handle inbound Telegram `Update` payloads. For each message: find-or-create `Customer`, find-or-create `Conversation`, persist `Message`, trigger AI routing pipeline.

## Endpoint
```
POST /api/webhook/telegram/{channelId}
```
Unauthenticated (Telegram calls this). Security: validate the `channelId` maps to an active channel in a valid workspace.

## Processing Flow
```
Telegram Update
  → resolve Channel by channelId
  → find-or-create Customer (by telegramId + workspace)
  → find-or-create Conversation (active conv for this customer, or new)
  → persist Message (role=CUSTOMER, telegramMessageId)
  → publish internal event → AI routing (M5)
```

## Files to Create
- `telegram/dto/TelegramUpdate.java` — deserialize Telegram Update JSON
- `telegram/dto/TelegramMessage.java`
- `telegram/dto/TelegramUser.java`
- `telegram/service/TelegramWebhookService.java` — orchestrates the flow above
- `telegram/controller/TelegramWebhookController.java`
- `customer/service/CustomerService.java` — find-or-create logic
- `conversation/service/ConversationService.java` — find-or-create open conversation

## Key Rules
- Run webhook processing on **Virtual Threads** (Java 21) — Telegram can burst; don't block the servlet thread pool
- find-or-create Customer must be idempotent: unique constraint on `(telegramId, workspace_id)`
- find-or-create Conversation: one open (`AI_HANDLING` or `NEEDS_HUMAN`) conversation per customer; create new only if none exists or last is `RESOLVED`
- Persist message before triggering AI — if AI call fails, the message record is safe
- Return HTTP 200 immediately to Telegram regardless of AI outcome (Telegram retries on non-200)
