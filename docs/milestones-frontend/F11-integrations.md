# F11 — Integrations (Channels + CRMs)

**Status:** TODO
**Port from:** `frontend/prototype/QUID Integrations.dc.html` ("Connected CRMs", stat tiles, `Healthy` status).

## Objective
Port the Integrations page and map it to what the backend actually has: **Telegram channels** (live) + **Google Sheets (M9)** and **Bitrix24 (M10)** connectors.

## Prototype layout
"Integrations" title, stat tiles (`2` connected, `3,420`, `184`, `Healthy`), "Connected CRMs" section with connector cards.

## Design → API adaptation
The prototype frames everything as "CRMs"; the backend's primary integration is the **Telegram Channel**. Split the page into two sections:

**1. Channels (Telegram)** — live now:
- Card per channel: name, bot username (token masked `****<last4>`), active toggle, assigned AI agent, copyable `webhookUrl`.
- Add channel modal → `POST /api/channels` (botToken). Activate/deactivate, delete (confirm).
- Assign agent uses the agent endpoint: `PUT /api/agents/{agentId}/channels/{channelId}`.

**2. CRMs** — Google Sheets (M9), Bitrix24 (M10):
- Connector cards with connect/disconnect + health (`Healthy` badge from prototype). Wire when M9/M10 backend lands; until then render as "Coming soon" cards (don't fake connected state).

## Code structure
- `types/channels.ts`, `features/integrations/adapters.ts` (token masking, status→health badge, agent name lookup), `hooks.ts`, `components/` (`ChannelCard`, `AddChannelModal`, `CrmCard`).
- `navigator.clipboard.writeText` for webhook copy (no library).

## API contract
- `GET /api/channels`, `POST /api/channels`, `DELETE /api/channels/{id}`
- `PUT /api/channels/{id}/activate` · `/deactivate`
- `PUT /api/agents/{agentId}/channels/{channelId}`

## Definition of Done
- Channels section fully functional (add/toggle/assign/delete/copy webhook).
- CRM cards present; real connect flow gated on M9/M10, no fake "connected".
- Visual match to prototype, both themes.
