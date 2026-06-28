# F9 — Usage (repurposed from the Products prototype)

**Status:** TODO
**Port from:** `frontend/prototype/QUID Products.dc.html` — **reuse the layout, replace the meaning.**

## Objective
The backend has no Product/catalog concept (and the target market needs none for v1). Repurpose this page's table + stat tiles into a **Usage / consumption** view: how much AI, messaging, and conversation volume the workspace is using.

## Prototype layout to keep
"Products" title, 4 stat tiles (`128`, `112`, `11`, `5`), a searchable/filterable table with rows. Keep the chrome; swap the data.

## Design → API adaptation
| Prototype | Becomes (Usage) |
|---|---|
| Title "Products" | "Usage" |
| 4 stat tiles | Messages this period · AI-handled · Human-handled · Active channels |
| table rows (products) | usage breakdown — by channel **or** by day **or** by agent (pick one for v1) |

Likely metrics (all already derivable from existing tables — `Message`, `Conversation`, `Channel`):
- Total messages (period), AI vs human split, conversations opened/resolved, avg confidence, per-agent token/usage if tracked.

## Backend dependency
`GET /api/usage?from=&to=` → `UsageResponse { messages, aiHandled, humanHandled, byDay[] | byChannel[] }`. Workspace-scoped, single aggregate query. Small backend milestone (can share the dashboard stats endpoint — see F4).

## Code structure
- `types/usage.ts`, `features/usage/adapters.ts` (number→`48.2k` formatting, % splits), `hooks.ts`, `components/` (`UsageTiles`, `UsageTable`). Reuse `StatCard` from F1.

## Definition of Done
- Page matches the Products layout, relabeled to Usage.
- Tiles + table show real consumption data; no product/inventory concepts remain.
