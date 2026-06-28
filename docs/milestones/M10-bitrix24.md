# M10 — Bitrix24 Integration

## Goal

Direct native integration with Bitrix24 — the dominant CRM in CIS markets (Uzbekistan, Kazakhstan, Russia). When a customer messages on Telegram, a lead appears in Bitrix24 automatically. No Zapier, no middleware, no extra cost for the user.

## Why Bitrix24

- Free tier is generous — most small/mid Uzbek businesses already use it
- REST API is straightforward with a webhook-based incoming integration
- Far more common in CIS than HubSpot or Salesforce
- Business owners already manage their sales pipeline there

## Data Flow

```
Customer messages on Telegram
    → QUID creates Conversation
    → Bitrix24Client creates Lead with customer name + Telegram ID
    → Each message added as a Timeline Activity on the lead
    → NEEDS_HUMAN → lead tagged "Escalated", responsible rep notified
    → RESOLVED → lead moved to "Closed" stage
```

## Event Mapping

| QUID Event | Bitrix24 Action |
|---|---|
| Conversation created | Create Lead (name, Telegram ID, source = "Telegram") |
| Customer message | Add Timeline comment to lead |
| NEEDS_HUMAN | Tag lead "Escalated" + assign to responsible rep |
| Agent assigned | Update lead responsible field |
| RESOLVED | Move lead to Closed stage |

## Data Model

```
Bitrix24Connection
  - id
  - workspace_id
  - webhookUrl        (Bitrix24 inbound webhook URL — contains auth token)
  - active
  - createdAt
```

No OAuth needed — Bitrix24 inbound webhooks contain the token in the URL. Business owner generates it in Bitrix24 settings in 30 seconds.

## Setup Flow (for the business owner)

```
1. In Bitrix24: Settings → Developer resources → Inbound webhooks → Create
2. Copy the webhook URL (looks like https://domain.bitrix24.ru/rest/1/abc123/)
3. Paste into QUID
4. Done — leads start appearing automatically
```

## API

```
POST   /api/integrations/bitrix24          Connect (webhookUrl)
GET    /api/integrations/bitrix24          Get current connection
DELETE /api/integrations/bitrix24          Disconnect
POST   /api/integrations/bitrix24/test     Create a test lead to verify
```

## Package Structure

```
integration/
  bitrix24/
    entity/Bitrix24Connection.java
    repository/Bitrix24ConnectionRepository.java
    dto/Bitrix24ConnectionRequest.java
    dto/Bitrix24ConnectionResponse.java
    mapper/Bitrix24ConnectionMapper.java
    controller/Bitrix24Controller.java
    service/Bitrix24SyncService.java    ← hooks into QUID events
    client/Bitrix24Client.java          ← REST calls to Bitrix24 API
```

## Out of Scope for MVP

- Two-way sync (Bitrix24 → QUID)
- Deal / pipeline stage management beyond open/closed
- amoCRM (add as M10b if there is demand — same pattern, different API)
- Contact deduplication
