# F7 — AI Routing Controls (Takeover · Confidence · Assign)

**Status:** TODO
**Port from:** the thread header of `QUID Inbox.dc.html` (status badge + "AI handling" toggle + kebab, lines ~201–221).

## Objective
The human-in-the-loop mechanic: surface confidence and give agents Take Over / Resolve / Assign — extending the F5 thread header.

## What to build
- `features/inbox/components/ThreadActions.tsx` — the prototype header's badge + toggle, made functional:
  - **Status badge** — `AI handling` (accent) / `Needs human` (`#FBBF24`) / `Resolved` (`#4ADE80`), already styled in prototype.
  - **Take Over** → `PUT /api/inbox/{id}/takeover` (status NEEDS_HUMAN, assign current user).
  - **Resolve** → `PUT /api/inbox/{id}/resolve` (status RESOLVED; backend fires M11 memory async).
  - **Assign to…** (kebab menu) → `PUT /api/inbox/{id}/assign/{staffId}`, staff from `GET /api/staff`.
- Conditional rendering by status × role:
  ```
  AI_HANDLING → Take Over (ADMIN/AGENT), Resolve (ADMIN)
  NEEDS_HUMAN → Resolve, Assign to…
  RESOLVED    → read-only (no actions, input disabled)
  ```

## Design → API adaptation
- Confidence color is computed **against the assigned agent's `confidenceThreshold`** (`GET /api/agents/{id}`), not a hardcoded 0.7 — lives in `inbox/adapters.ts::confColor`.
- Optimistic Takeover: flip badge to "Human" immediately, revert on error.
- Assign dropdown uses cached `useQuery(['staff'], { staleTime: 60_000 })`.
- Resolve needs no frontend memory hook — backend handles `memoryService.summarize()` async.

## Definition of Done
- Badge renders correct tier/color for all three statuses.
- Take Over transitions instantly (optimistic); Resolve disables the reply bar.
- AGENT does not see Resolve on AI_HANDLING.
