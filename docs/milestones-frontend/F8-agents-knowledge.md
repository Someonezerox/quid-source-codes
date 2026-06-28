# F8 — Agents & Knowledge Base

**Status:** TODO
**Port from:** `frontend/prototype/QUID Agents.dc.html` (stat row + table + "Add agent" wizard `stepTitle`).

## ⚠️ Naming collision to resolve first
The prototype's Agents table has **Online / Offline / Away presence**, avatar `@handles`, "Active chats", "Avg resp" — that's **human-staff** framing. But the backend `Agent` = **AI entity** (systemPrompt, confidenceThreshold, KB), and humans are `User` with `Role.AGENT` (CLAUDE.md, critical rule). Decide:
- **(a)** This page is the **AI Agents** CRUD (rename presence → `active`, drop human-only columns), and human staff lives under Settings (F12). ← assumed default.
- **(b)** This page is **human staff presence**, and AI-agent config lives elsewhere.

Spec below assumes **(a)**. Confirm before building.

## What the prototype shows
Stat tiles (`18` total, `11` online, `38s` avg resp, `94%` resolution), filter tabs, search, **Add agent** button opening a multi-step wizard (`stepTitle`), and a table: Agent · Status · Active chats · Handled · Avg resp · Resolution.

## Design → API adaptation
| Prototype | Real (AI Agent) |
|---|---|
| `Online/Offline/Away` | `active: boolean` → Active / Inactive (drop 3-state presence) |
| `Active chats` | count of conversations where `aiAgent = id` & not resolved |
| `Handled` / `Resolution` | from M11 agent-learning metrics (`GET /api/agents/{id}` learning) |
| `Avg resp` | from agent metrics (or omit v1) |
| stat tiles | aggregate of the above |
| **Add agent wizard** | steps → `name` → `systemPrompt` (monospace) → `confidenceThreshold` (slider 0–1, live %) → attach Knowledge Base → `active` |

- `confidenceThreshold` is a **slider**, not a number field — it's a 0–1 dial.
- System prompt = plaintext monospace textarea (no rich text).

## Knowledge Base (agent detail)
- `AgentDetailPage` (`/agents/:id`): config + KB section.
- List/add/delete entries: `{title, content}`; embeddings generated server-side (`EmbeddingClient`) — frontend just POSTs text.
- KB not paginated (SMB <100 entries; YAGNI).

## Code structure
- `types/agents.ts`, `features/agents/adapters.ts` (presence→active, score→%, gradient), `hooks.ts`, `components/` (`AgentTable`, `AgentRow`, `AgentWizard`, `KnowledgeBaseSection`).

## API contract
- `GET/POST/PUT/DELETE /api/agents`, `GET /api/agents/{id}`
- `PUT /api/agents/{agentId}/channels/{channelId}` (assign to channel)
- `GET/POST/DELETE /api/agents/{id}/knowledge`

## Definition of Done
- Naming decision recorded; table + wizard match prototype.
- Create/edit agent (prompt, threshold slider, active); KB add/list/delete.
