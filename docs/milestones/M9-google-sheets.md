# M9 — Google Sheets Integration

## Goal

Any business — including a salon owner in Tashkent with no technical knowledge — can connect their Google Sheet and see every conversation, customer, and resolution automatically logged there. Free, universal, zero setup friction.

## Why Google Sheets first

- Every business already has a Google account — no new signup
- Free with no usage limits for this scale
- Acts as a lightweight CRM for small businesses who don't use Bitrix24 or amoCRM
- Familiar — business owners already track things in spreadsheets

## What Gets Logged

One row per conversation, updated on each status change:

| Column | Value |
|---|---|
| Date | Conversation start time |
| Customer | First + last name or username |
| Telegram ID | Customer's Telegram ID |
| Channel | Which bot they messaged |
| AI Agent | Which agent handled it |
| Status | AI_HANDLING / NEEDS_HUMAN / RESOLVED |
| Confidence | Final AI confidence score |
| Messages | Total message count |
| Handled by | Human agent name if taken over |
| Resolved at | Timestamp of resolution |

## Data Model

```
SheetsConnection
  - id
  - workspace_id
  - spreadsheetId     (from the Google Sheets URL)
  - sheetName         (tab name, default "QUID")
  - credentials       (service account JSON, encrypted at rest)
  - active
  - createdAt
```

## Setup Flow (for the business owner)

```
1. Admin creates a Google Service Account in Google Cloud Console
2. Shares their Sheet with the service account email (editor access)
3. Pastes spreadsheetId + service account JSON into QUID
4. QUID creates the header row automatically
5. Every resolved conversation appears as a new row
```

## API

```
POST   /api/integrations/sheets          Connect (spreadsheetId + credentials)
GET    /api/integrations/sheets          Get current connection
DELETE /api/integrations/sheets          Disconnect
POST   /api/integrations/sheets/test     Verify connection + write test row
```

## Integration Points

- `InboxService.resolve()` → append/update row for that conversation
- `AiRoutingService` → update status column when escalated to human

## Out of Scope for MVP

- OAuth flow (use service account JSON for now — simpler)
- Real-time row updates per message (only on resolve)
- Multiple sheets per workspace
- Reading from Sheets (one-way push only)
