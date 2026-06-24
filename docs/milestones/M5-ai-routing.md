# M5 — AI Routing & RAG Knowledge Base

**Status:** DONE

## Goal
Auto-reply to customer messages using Claude. Use a confidence score to decide whether AI handles it or escalates to a human. RAG from the workspace's knowledge base improves answer quality.

## Flow
```
New CUSTOMER message (from M3)
  → build prompt: system (KB chunks) + conversation history
  → call Claude API → get reply + confidence score (0.0–1.0)
  → if score >= threshold → send AI reply, status stays AI_HANDLING
  → if score < threshold → status = NEEDS_HUMAN (no auto-reply)
```

## Confidence Score
Claude returns a structured response:
```json
{ "reply": "...", "confidence": 0.87 }
```
Threshold configurable per workspace (default 0.75). Store in `Workspace` entity.

## RAG Integration
- `KnowledgeEntry.embedding` — pgvector `vector(1536)` column
- On query: embed customer message → cosine similarity search → top-K chunks injected into system prompt
- Embeddings generated via Claude API (or OpenAI embeddings endpoint — TBD)

## Files to Create
- `ai/service/AiRoutingService.java` — orchestrates prompt build + Claude call + routing decision
- `ai/service/RagService.java` — vector search against `knowledge_entry`
- `ai/client/ClaudeClient.java` — HTTP client for Anthropic API
- `ai/dto/AiResponse.java` — parsed Claude response
- `knowledge/service/KnowledgeService.java` — CRUD for KB entries + trigger embedding generation
- `knowledge/controller/KnowledgeController.java` — admin API to manage KB

## Key Rules
- AI calls on **Virtual Threads** — never block servlet threads waiting on Claude
- Store `confidenceScore` on `Conversation` after each AI interaction (already on entity)
- Conversation history in prompt: last N messages (configurable, default 10) to stay within context window
- Embedding generation is async — KB entry is saved first, embedding backfilled
- pgvector index: `CREATE INDEX ON knowledge_entry USING ivfflat (embedding vector_cosine_ops)`
