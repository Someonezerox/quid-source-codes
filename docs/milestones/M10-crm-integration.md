# M10 — Native CRM Integration

## Goal

Sync QUID conversations directly to CRM systems without requiring Zapier/Make as middleware. First targets: amoCRM and Bitrix24 (dominant in CIS market).

## Data Flow

```
Customer messages on Telegram
    → QUID creates Conversation
    → CRM integration creates/updates Lead
    → Messages sync as CRM notes
    → Resolution closes the deal
```

## CRM Event Mapping

| QUID Event | CRM Action |
|---|---|
| `CONVERSATION_CREATED` | Create lead + contact (Telegram name, ID) |
| `CUSTOMER_MESSAGE` | Add note to lead |
| `NEEDS_HUMAN` | Set lead tag "escalated", notify responsible rep |
| `AGENT_ASSIGNED` | Assign lead to that rep in CRM |
| `CONVERSATION_RESOLVED` | Move lead to "Closed / Won / Lost" stage |

## Data Model

```
CrmConnection
  - id
  - workspace_id
  - provider        (AMO_CRM, BITRIX24)
  - apiUrl          (account-specific, e.g. https://domain.amocrm.ru)
  - accessToken
  - refreshToken
  - active
  - createdAt
```

## API

```
POST   /api/integrations/crm          Connect CRM (provider + credentials)
GET    /api/integrations/crm          List connections
DELETE /api/integrations/crm/{id}     Disconnect
POST   /api/integrations/crm/{id}/test  Test connection (ping their API)
```

## Package Structure

```
integration/
  crm/
    entity/CrmConnection.java
    enums/CrmProvider.java
    repository/CrmConnectionRepository.java
    dto/CrmConnectionRequest.java
    dto/CrmConnectionResponse.java
    mapper/CrmConnectionMapper.java
    controller/CrmController.java
    service/CrmSyncService.java       ← fires on QUID events, routes to provider
    client/
      AmoCrmClient.java               ← amoCRM REST API
      Bitrix24Client.java             ← Bitrix24 REST API
```

## Monetization

Native CRM integration = premium feature. Webhooks (M9) stay free, direct sync is paid tier.

## Out of Scope for MVP

- OAuth flow for amoCRM (use long-lived token for now)
- HubSpot / Salesforce (add later based on demand)
- Two-way sync (CRM → QUID) — one-way push only
- Deal value / pipeline management
