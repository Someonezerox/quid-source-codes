# M2 — Channel Management API

**Status:** DONE

## Goal
Expose CRUD endpoints so workspace admins can register Telegram bots and manage their channels.

## Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/channels` | Register a new Telegram bot (botToken, webhookUrl) |
| GET | `/api/channels` | List all channels in the workspace |
| GET | `/api/channels/{id}` | Get single channel |
| PUT | `/api/channels/{id}` | Update botToken / webhookUrl |
| DELETE | `/api/channels/{id}` | Deactivate channel |

## Files to Create
- `channel/dto/ChannelRequest.java` — input DTO (botToken, webhookUrl)
- `channel/dto/ChannelResponse.java` — output DTO
- `channel/service/ChannelService.java` — business logic, workspace scoping
- `channel/controller/ChannelController.java` — REST layer

## Key Rules
- All queries MUST filter by `workspace` — never expose channels across workspaces
- `botToken` is sensitive: never return it in list responses, only in single-get
- Deactivate (set `active=false`) instead of hard delete — preserves conversation history linkage
- Validate `botToken` format before persisting (Telegram tokens follow `{id}:{hash}` pattern)
