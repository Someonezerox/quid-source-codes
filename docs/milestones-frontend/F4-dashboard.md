# F4 — Dashboard

**Status:** TODO
**Port from:** `frontend/prototype/QUID Dashboard.dc.html` (894 lines — the richest page).

## Objective
Port the dashboard 1:1, but replace its mock metrics — including the **revenue tile** — with real **usage** stats the platform actually tracks.

## What the prototype shows (mock)
"Good morning, {name} 👋" greeting + a row of stat tiles: `142`, `48.2k`, `86%`, **`$22.4k`**, `1.2s`, plus a `1,284` chart and an onboarding/step block (`stepTitle`).

## Design → API adaptation (the key work)
There is **no dashboard endpoint yet** — this milestone needs a backend companion (see "Backend dependency"). Map the prototype tiles to real, usage-based metrics:

| Prototype tile | Becomes | Source |
|---|---|---|
| `142` | Open conversations | count where status ≠ RESOLVED |
| `48.2k` | Messages handled (period) | `Message` count |
| `86%` | AI resolution rate | resolved-by-AI / total resolved |
| **`$22.4k` (revenue)** | **AI-handled %** or **avg confidence** | usage metric — NO money |
| `1.2s` | Avg AI response time | message latency |
| `1,284` chart | Conversations over time | grouped by day |

- Greeting name ← `authStore`.
- `stepTitle` onboarding block → drive off real setup state (has channel? has agent? has KB?) or cut for v1 (YAGNI — confirm).

## Backend dependency
`GET /api/dashboard/stats` → `DashboardStatsResponse { openConversations, messagesHandled, aiResolutionRate, aiHandledPct, avgResponseTimeMs, conversationsByDay[] }`. Workspace-scoped, single aggregate query (no N+1). Track as a small backend milestone.

## Code structure
- `types/dashboard.ts` — `DashboardStatsResponse`.
- `features/dashboard/adapters.ts` — DTO → tile ViewModels (formats `48211` → `48.2k`, ms → `1.2s`).
- `features/dashboard/hooks.ts` — `useDashboardStats()`.
- `features/dashboard/components/` — `StatTileRow`, `TrendChart` (reuse `StatCard` from F1).

## Definition of Done
- Page matches prototype layout in both themes.
- All tiles show live data; **no revenue/currency anywhere**.
- Loading skeletons; empty state for fresh workspace.
