# QUID

AI-first omni-channel customer communication platform. Aggregates Telegram conversations into a unified inbox, uses a confidence-score engine to route between AI agents and human agents, and supports RAG-based knowledge bases for autonomous responses.

---

## How It Works

```
Customer sends Telegram message
    → Webhook receives it → stored as Conversation + Message
    → AiRoutingService (async, virtual thread)
        → fetches channel's assigned AI Agent
        → RAG: embeds message → cosine similarity search over Agent's Knowledge Base
        → calls Claude with agent's persona + KB context
        → confidence >= threshold → AI replies via Telegram Bot API
        → confidence <  threshold → status = NEEDS_HUMAN → human agent notified
    → Human agent opens Inbox → sees conversation + customer context
    → Agent takes over → sends messages → resolves
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Java 21 (Virtual Threads) |
| Framework | Spring Boot 4.x, Spring Security, Spring Data JPA |
| Database | PostgreSQL + pgvector (vector similarity search) |
| AI | OpenRouter — `anthropic/claude-haiku-4-5-20251001` (chat) |
| Embeddings | OpenRouter — `openai/text-embedding-3-small` (1536 dims) |
| Auth | JWT (access + refresh tokens, BCrypt) |
| Utilities | Lombok |

---

## Prerequisites

- Java 21+
- PostgreSQL 15+ with the `pgvector` extension
- An OpenRouter API key (covers both chat and embeddings)

### PostgreSQL setup

```sql
CREATE DATABASE quid;
-- pgvector extension is created automatically on first startup
```

---

## Configuration

All sensitive values are read from environment variables. Export before running:

```bash
export OPENROUTER_API_KEY=sk-or-...
export JWT_SECRET=your-32-plus-char-random-secret
```

| Property | Env var | Default | Description |
|---|---|---|---|
| `ai.open-router-api-key` | `OPENROUTER_API_KEY` | — | OpenRouter API key (chat + embeddings) |
| `ai.chat-model` | — | `anthropic/claude-haiku-4-5-20251001` | Model used for AI replies |
| `ai.embedding-model` | — | `openai/text-embedding-3-small` | Model used for RAG embeddings |
| `ai.max-history-messages` | — | `10` | Message window sent to model |
| `ai.rag-top-k` | — | `5` | Top-K KB chunks injected into prompt |
| `app.jwt.secret` | `JWT_SECRET` | insecure default | Sign secret — always override in prod |
| `app.jwt.access-token-expiry` | — | `900000` ms (15 min) | Access token lifetime |
| `app.jwt.refresh-token-expiry` | — | `604800000` ms (7 days) | Refresh token lifetime |

Database defaults to `jdbc:postgresql://localhost:5432/quid`. Override via `spring.datasource.*` in `application.properties`.

---

## Running

```bash
./gradlew bootRun
```

Schema is managed by `ddl-auto=update` — tables are created and updated automatically on startup.

---

## Architecture

### Package structure (feature-based)

```
src/main/java/org/example/quid/
├── agent/              AI Agent entity — persona, KB ownership, confidence threshold
│   ├── controller/
│   ├── dto/            Pure data records (no logic)
│   ├── entity/
│   ├── mapper/         AgentMapper — all entity ↔ dto conversion
│   ├── repository/
│   └── service/
├── ai/                 OpenRouter chat + embedding clients, RAG service, routing
├── auth/               Register, login, refresh, logout — JWT issuance
├── channel/            Telegram channel CRUD — holds bot token, assigned AI agent
├── conversation/       Conversation + Message entities, Inbox API
├── customer/           Customer profiles, auto-created on first Telegram message
├── infrastructure/     VectorStoreInitializer — pgvector extension + column + index
├── knowledge/          Knowledge bases and entries scoped to an AI agent
├── security/           JwtAuthFilter, JwtService, SecurityConfig
├── telegram/           Webhook ingestion, Telegram Bot API client
├── user/               User entity (ADMIN / AGENT roles), UserDetailsService
└── workspace/          Workspace entity — multi-tenancy root
```

### Key design decisions

**AI Agent as the routing unit** — each `Channel` is assigned one `Agent`. The agent carries its own system prompt, confidence threshold, and knowledge bases. Different channels can run different agents (sales bot, support bot, etc.). As more KB entries are added, `avgConfidenceScore` trends up and escalation rate trends down.

**Workspace isolation** — every entity is scoped to a `Workspace`. All repository queries filter by workspace. Cross-workspace data leaks are structurally impossible.

**Async AI routing** — the webhook handler commits its transaction first, then fires `AiRoutingService.process()` on a virtual thread. This ensures the async method always sees committed data.

**RAG without custom Hibernate types** — pgvector column managed by `ApplicationRunner` DDL, embeddings persisted via `JdbcTemplate`, similarity search via native `@Query` with `CAST(? AS vector)`.

**Mapper pattern** — every feature has a `{Feature}Mapper` `@Component`. DTOs are pure records with no logic. All entity ↔ DTO conversion lives in the mapper. Services inject and call the mapper.

---

## API Reference

All endpoints except `POST /api/auth/**` and `POST /api/webhook/**` require:
```
Authorization: Bearer <access_token>
```

### Auth — `/api/auth`

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/register` | `{email, password, fullName}` | Create workspace + ADMIN user |
| POST | `/login` | `{email, password}` | Returns access + refresh tokens |
| POST | `/refresh` | `{refreshToken}` | Rotate refresh token, issue new pair |
| POST | `/logout` | `{refreshToken}` | Revoke refresh token |

**Response (register / login / refresh):**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "uuid",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

### AI Agents — `/api/agents`

| Method | Path | Description |
|---|---|---|
| POST | `/` | Create an AI agent |
| GET | `/` | List all agents with performance stats |
| GET | `/{id}` | Agent detail — systemPrompt, knowledge bases, assigned channels |
| PUT | `/{id}` | Update name, persona, threshold |
| DELETE | `/{id}` | Deactivate agent (soft delete) |
| PUT | `/{id}/channels/{channelId}` | Assign agent to a channel |
| DELETE | `/{id}/channels/{channelId}` | Unassign agent from channel |

**Create / Update body:**
```json
{
  "name": "Support Bot",
  "description": "Handles tier-1 support queries",
  "systemPrompt": "You are a friendly support agent for Acme Corp. Be concise and helpful.",
  "confidenceThreshold": 0.80
}
```

**List response includes live stats:**
```json
{
  "id": 1,
  "name": "Support Bot",
  "confidenceThreshold": 0.80,
  "active": true,
  "totalConversations": 142,
  "avgConfidenceScore": 0.87
}
```

### Channels — `/api/channels`

| Method | Path | Description |
|---|---|---|
| POST | `/` | Register a Telegram channel |
| GET | `/` | List all channels |
| GET | `/{id}` | Get channel |
| PUT | `/{id}` | Update name / bot token |
| DELETE | `/{id}` | Deactivate channel |

**Create / Update body:**
```json
{
  "name": "Main Support",
  "botToken": "123456789:ABC-...",
  "webhookUrl": "https://yourdomain.com/api/webhook/telegram/1"
}
```

### Knowledge Base — `/api/knowledge`

| Method | Path | Description |
|---|---|---|
| POST | `/bases` | Create knowledge base for an agent |
| GET | `/bases?agentId={id}` | List knowledge bases for an agent |
| DELETE | `/bases/{id}` | Delete knowledge base |
| POST | `/bases/{kbId}/entries` | Add entry (embedding generated async) |
| GET | `/bases/{kbId}/entries` | List entries |
| PUT | `/bases/{kbId}/entries/{entryId}` | Update entry + re-embed |
| DELETE | `/bases/{kbId}/entries/{entryId}` | Delete entry |

**Create KB:** `{ "agentId": 1, "name": "Product FAQ" }`

**Create entry:** `{ "title": "Refund Policy", "content": "We offer 30-day refunds on all orders..." }`

Embeddings are generated asynchronously after each entry save or update. The entry is immediately usable; the RAG search will include it once embedding completes (usually within seconds).

### Inbox — `/api/conversations`

| Method | Path | Description |
|---|---|---|
| GET | `/` | List conversations (`?status=NEEDS_HUMAN\|AI_HANDLING\|RESOLVED`) |
| GET | `/{id}` | Get conversation summary |
| GET | `/{id}/messages` | Full message history |
| POST | `/{id}/takeover` | Human agent takes over from AI |
| POST | `/{id}/resolve` | Mark conversation resolved |
| POST | `/{id}/messages` | Send message as agent |

**Send message body:** `{ "content": "Hi, let me help you with that." }`

### Telegram Webhook — `/api/webhook/telegram`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/{channelId}` | None | Telegram webhook receiver |

Register with Telegram after creating a channel:
```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://yourdomain.com/api/webhook/telegram/<channelId>"
```

---

## Conversation Lifecycle

```
         AI_HANDLING
        /            \
confidence >= threshold   confidence < threshold
       |                        |
  AI replies             NEEDS_HUMAN  ← human agent assigned via takeover
                               |
                           RESOLVED
```

---

## Quickstart

```bash
# 1. Create the database
psql -c "CREATE DATABASE quid;"

# 2. Set environment variables
export OPENROUTER_API_KEY=sk-or-...
export JWT_SECRET=some-random-32-char-secret

# 3. Run
./gradlew bootRun

# 4. Register an admin account
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"secret","fullName":"Admin"}'

# 5. Create an AI agent
curl -X POST http://localhost:8080/api/agents \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Support Bot","systemPrompt":"You are a helpful support agent.","confidenceThreshold":0.75}'

# 6. Create a Telegram channel and assign the agent
curl -X POST http://localhost:8080/api/channels \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Main","botToken":"<your_bot_token>","webhookUrl":"https://yourdomain.com/api/webhook/telegram/1"}'

curl -X PUT http://localhost:8080/api/agents/1/channels/1 \
  -H "Authorization: Bearer <token>"

# 7. Register the webhook with Telegram
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://yourdomain.com/api/webhook/telegram/1"
```

---

## Upcoming

| Milestone | Description |
|---|---|
| M7 | Human agent management — invite staff via email, deactivate accounts |
| M8 | Real-time notifications (SSE) — push `NEEDS_HUMAN` events to connected agents |
| M9 | Outbound webhooks — subscribe to QUID events, integrate with Zapier / Make / amoCRM / Sheets |
