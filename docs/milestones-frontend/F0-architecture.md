# F0 — Frontend Architecture & The Design↔API Contract

**Status:** TODO
**Read this first.** Every other F-milestone assumes the structure defined here.

## The core problem this solves
The prototypes in `frontend/prototype/*.dc.html` are a finished design. They render from **view-shaped props** — e.g. a conversation row consumes:
```js
{ initials:'MK', name:'Maria Kovács', avatarBg:'linear-gradient(...)',
  status:'AI handling', statusColor:'#A8E831', conf:'96%', confColor:'#4ADE80' }
```
The backend returns **raw DTOs** — e.g. `ConversationSummaryResponse { id, customerName, status: 'AI_HANDLING', confidenceScore: 0.96, lastMessageAt }`.

These two shapes never meet directly. The job of the whole frontend is the glue between them, and that glue must live in **one named layer**, not smeared across components.

## Layered structure (mirrors backend Controller → Service → Repository)

```
src/
  api/
    client.ts            ← single axios instance (auth, refresh, 401 retry)
    <feature>Api.ts      ← raw endpoint calls, returns DTOs verbatim
  types/
    <feature>.ts         ← TS interfaces mirroring backend DTOs 1:1 (no view fields)
  features/<feature>/
    adapters.ts          ← PURE functions: DTO → ViewModel. THE design↔API glue.
    hooks.ts             ← TanStack Query hooks; call api/, return ViewModels via adapters
    components/          ← ported prototype markup, presentational only
    <Feature>Page.tsx    ← composes hooks + components
  components/ui/         ← shared design-system atoms (Badge, StatCard, ConfidencePill…)
  components/layout/     ← AppShell, Sidebar, Topbar (ported from prototype)
  lib/                   ← formatters, design tokens, constants
  store/                 ← Zustand: authStore (token, role, workspaceId), uiStore (theme, accent)
  router/                ← routes + ProtectedRoute + RoleGuard
```

## The adapter rule (this is the whole point)
`adapters.ts` is the frontend twin of the backend `Mapper`:
- **Adapters are pure** — DTO in, ViewModel out. No fetching, no React, no side effects.
- **All design decisions live here** — status→color, confidence→pill color, name→initials, gradient avatar selection. A component never computes a color.
- **Components are dumb** — they receive a ViewModel and render. No `if (status === ...)` in JSX.
- **Never call the API from a component or an adapter** — only `hooks.ts` touches `api/`.

```ts
// features/inbox/adapters.ts
export function toConversationVM(dto: ConversationSummaryResponse): ConversationVM {
  return {
    id: dto.id,
    name: dto.customerName,
    initials: initials(dto.customerName),
    avatarBg: gradientFor(dto.id),
    status: STATUS_LABEL[dto.status],
    statusColor: STATUS_COLOR[dto.status],
    conf: `${Math.round(dto.confidenceScore * 100)}%`,
    confColor: confColor(dto.confidenceScore, dto.threshold),
    time: relativeTime(dto.lastMessageAt),
  };
}
```

## State boundaries
- **Server state → TanStack Query.** Lists, threads, entities. Never copied into Zustand.
- **Global client state → Zustand, two stores only.** `authStore` (token/role/workspaceId), `uiStore` (theme, accent — both already first-class in the prototypes).
- **URL state → React Router params.** Selected conversation, active filter tab.

## Definition of Done
- The four layers exist and the dependency direction is enforced (component → hook → api; adapter is a leaf).
- One reference feature (Inbox) implemented end-to-end through all four layers as the pattern other features copy.
