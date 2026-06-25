# CLAUDE.md - QUID Project Configuration

## Product
QUID is an AI-first omni-channel customer communication platform. Aggregates Telegram conversations into a unified inbox, uses a confidence-score engine to route between AI-handling and human agents, supports RAG-based knowledge bases for autonomous responses, and provides a "Take over" mechanism for agents. Telegram only for now — channel abstraction is in place to extend later.

## Tech Stack
* **Language:** Java 21+
* **Framework:** Spring Boot 4.x (Spring Data JPA, Spring Security)
* **Database:** PostgreSQL + pgvector (for RAG embeddings)
* **Utilities:** Lombok

## Architecture & Code Style Guidelines
* **Layering:** Controller → Service → Repository. No business logic in controllers or entities.
* **Database Efficiency:** Prevent N+1 queries. Use `JOIN FETCH` or Entity Graphs for any relationship traversal in list queries.
* **Concurrency:** Use Virtual Threads (Java 21) for Telegram webhook processing and AI calls.
* **Data Privacy:** Every domain entity is scoped to a `Workspace`. Never query across workspaces.
* **Lombok:** `@RequiredArgsConstructor` for DI. Never `@Data` on `@Entity` — use `@Getter` + `@Setter`.
* **Null safety:** Add `@NullMarked` only to classes that implement/extend Spring Security's `@NullMarked` interfaces (`UserDetails`, `UserDetailsService`, `OncePerRequestFilter`). Do NOT use package-info.java files.
* **Controller response style:** Never use `ResponseEntity`. Always use `@ResponseStatus` + bare return type:
  - POST that creates → `@ResponseStatus(HttpStatus.CREATED)` + return `T`
  - DELETE / no-body action → `@ResponseStatus(HttpStatus.NO_CONTENT)` + `void`
  - GET / PUT → bare return `T` / `List<T>` / `Page<T>` (200 is the default)
* **Mapper pattern:** Every feature that has DTOs must have a `{feature}/mapper/{Feature}Mapper.java`. See `agent/mapper/AgentMapper.java` as the reference implementation.
  - **DTOs are pure data records** — no `from()`, no `toEntity()`, no logic of any kind inside them
  - **All mapping lives in the mapper** — the mapper is a `@Component` injected into the service
  - **Four method types to implement** (only the ones needed for that feature):
    ```
    toResponse(Entity, ...)           → response DTO        (used in GET list + GET single)
    toDetailResponse(Entity, ...)     → richer detail DTO   (used in GET /{id} only)
    toEntity(Request, Workspace)      → new Entity          (used in POST / create)
    update(Entity, Request)           → void                (mutates entity in place, used in PUT)
    ```
  - **Service calls mapper, not the DTO**: `agentMapper.toResponse(agent, ...)` not `AgentResponse.from(agent, ...)`
  - **Never put cross-feature logic in a mapper** — if building a response requires repository calls (e.g. stats), do that in the service and pass the results as parameters to the mapper method

## What Is Already Built (do NOT re-implement)
* **Auth** — register (creates workspace + ADMIN user), login, refresh, logout via `/api/auth/**`
* **JWT** — `JwtService`, `JwtAuthFilter`, `JwtProperties` (`app.jwt.*`)
* **User/Role** — `User` entity, `Role` enum (`AGENT`, `ADMIN`). Register always creates ADMIN.
* **Workspace** — `Workspace` entity + `WorkspaceRepository`. Every user and domain entity is scoped to a workspace.
* **Channel** — `Channel` entity (`ChannelType.TELEGRAM`), `ChannelRepository`. Holds `botToken`, `webhookUrl`, `active`.
* **Customer** — `Customer` entity (telegramId + workspace = unique), `CustomerRepository`. Status: `ACTIVE`, `RESOLVED`.
* **Conversation** — `Conversation` entity (status: `AI_HANDLING`, `NEEDS_HUMAN`, `RESOLVED`; `confidenceScore`; nullable `assignedAgent`), `ConversationRepository`.
* **Message** — `Message` entity (role: `CUSTOMER`, `AI`, `AGENT`; `telegramMessageId`), `MessageRepository`.
* **Knowledge** — `KnowledgeBase` + `KnowledgeEntry` entities + repositories. pgvector embeddings not yet added.
* **Exceptions** — `GlobalExceptionHandler`: `ConflictException` (409), `ResourceNotFoundException` (404), `IllegalArgumentException` (400), `MethodArgumentNotValidException` (400). Never add a second `@ControllerAdvice`.
* **DB** — PostgreSQL `quid` database, local user `jahongirshuxratov`, `ddl-auto=update`

## RULES
1. Before starting the work, ask about which role to pick from ROLES.MD
2. If you see context is getting messy, warn me
3. Always check "What Is Already Built" before writing any new class or utility using claude-mem search
4. If you see more than 15k token usage in previous prompt compact and then move on