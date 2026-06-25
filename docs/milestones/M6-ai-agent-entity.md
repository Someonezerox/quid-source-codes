# M6 — AI Agent Entity

**Status:** TODO

## Goal
Workspace owners create named AI agents with their own persona, knowledge base, and confidence threshold. Each channel is assigned one agent. The routing engine uses the channel's agent — not the workspace — as the unit of configuration.

## Core Concept
```
Workspace
  └── Agent (e.g. "Sales Bot", "Support Bot", "Onboarding Assistant")
        ├── systemPrompt       — persona & instructions
        ├── confidenceThreshold — routing threshold (default 0.75)
        ├── KnowledgeBases[]   — agent's own KB(s)
        └── Channels[]         — channels this agent is assigned to

Incoming message → Channel → Agent → KB + systemPrompt → Claude → route
```

## Architectural Changes to Existing Code

| File | Change |
|------|--------|
| `Workspace.java` | Remove `confidenceThreshold` field (moves to Agent) |
| `KnowledgeBase.java` | Replace `workspace` FK with `agent` FK |
| `KnowledgeEntryRepository` | Similarity search query filters by `agent_id` instead of `workspace_id` |
| `Channel.java` | Add nullable `@ManyToOne Agent assignedAgent` |
| `Conversation.java` | Add nullable `@ManyToOne Agent aiAgent` (which agent handled this conversation) |
| `ClaudeClient.chat()` | Accept `String systemPrompt` param instead of using the hardcoded constant |
| `AiRoutingService` | Load agent from `conversation.channel.assignedAgent`; use agent's `systemPrompt`, `confidenceThreshold`, and KBs |
| `RagService.buildContext()` | Accept `Agent` instead of `Workspace`; search KBs by `agent_id` |

## New Entity: Agent
```
agent
  id                  BIGSERIAL PK
  workspace_id        FK → workspaces
  name                VARCHAR NOT NULL
  description         TEXT
  system_prompt       TEXT NOT NULL
  confidence_threshold DOUBLE PRECISION DEFAULT 0.75
  active              BOOLEAN DEFAULT TRUE
  created_at          TIMESTAMP
```

## New Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/agents` | Create agent in workspace |
| GET | `/api/agents` | List all agents in workspace |
| GET | `/api/agents/{id}` | Get agent detail + KB list + assigned channels |
| PUT | `/api/agents/{id}` | Update name, description, systemPrompt, threshold |
| DELETE | `/api/agents/{id}` | Deactivate agent (soft delete) |
| PUT | `/api/channels/{id}/agent` | Assign agent to channel |
| DELETE | `/api/channels/{id}/agent` | Unassign agent from channel |

## Knowledge Base Ownership
- `KnowledgeBase` moves from workspace-scoped to agent-scoped
- Existing `/api/knowledge/bases` endpoints take `agentId` in request body
- Agent with no KB → RAG returns empty context → Claude answers from systemPrompt only
- Multiple KBs per agent allowed (e.g. product docs + pricing sheet)

## Performance Tracking (on Agent)
Computed fields returned in `AgentResponse` — no extra columns, derived from existing data:
- `totalConversations` — COUNT of conversations where `ai_agent_id = agent.id`
- `escalationRate` — % of those with final status `NEEDS_HUMAN` or `RESOLVED` after takeover
- `avgConfidenceScore` — AVG of `conversation.confidence_score` where `ai_agent_id = agent.id`

These drive the "gradually learns" feedback loop: as KB grows, `avgConfidenceScore` trends up and `escalationRate` trends down.

## Files to Create
- `agent/entity/Agent.java`
- `agent/repository/AgentRepository.java`
- `agent/dto/AgentRequest.java` — name, description, systemPrompt, confidenceThreshold
- `agent/dto/AgentResponse.java` — includes computed performance stats
- `agent/service/AgentService.java` — CRUD + stats queries
- `agent/controller/AgentController.java`

## Key Rules
- Agent is workspace-scoped — never expose agents across workspaces
- Channel with no `assignedAgent` → incoming message is stored but AI routing is skipped (conversation stays `AI_HANDLING` without auto-reply)
- Deactivated agent → same as no agent (skip routing)
- `systemPrompt` must end with the JSON format instruction so ClaudeClient can parse the response
