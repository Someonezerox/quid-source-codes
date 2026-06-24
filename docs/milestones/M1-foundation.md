# M1 — Foundation

**Status:** DONE

## What Was Built
- All domain entities: `User`, `Workspace`, `Channel`, `Customer`, `Conversation`, `Message`, `KnowledgeBase`, `KnowledgeEntry`
- All repositories
- Auth flow: register (creates workspace + ADMIN user), login, refresh, logout via `/api/auth/**`
- JWT: `JwtService`, `JwtAuthFilter`, `JwtProperties`
- Spring Security config
- `GlobalExceptionHandler`: 409 ConflictException, 404 ResourceNotFoundException, 400 IllegalArgumentException + validation
- PostgreSQL `quid` DB connected, `ddl-auto=update`

## Architectural Decisions
- Every domain entity is scoped to a `Workspace` — multi-tenancy at the data layer, not the app layer
- `Channel` has a `ChannelType` enum so non-Telegram channels can be added without schema changes
- Refresh tokens stored in DB for revocation support
