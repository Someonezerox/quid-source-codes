# F1 — Design System Extraction & Project Setup

**Status:** TODO
**Source of truth:** the `<style>` + `:root` blocks at the top of every `frontend/prototype/*.dc.html`.

## Objective
Stand up the Vite project AND extract the prototype's design system into reusable tokens + atoms — so every later milestone ports markup against real tokens, not hardcoded hex.

## Project setup
- Vite + React 18 + TypeScript (strict) in `frontend/`
- Tailwind CSS v3, `@tailwindcss/forms`
- TanStack Query, axios, zustand, react-router-dom v6, lucide-react
- Path alias `@/` → `src/`
- ESLint + Prettier; `npm run lint` clean
- Vite dev proxy `/api → http://localhost:8080`
- Keep `frontend/prototype/` as-is for reference; build into `frontend/src/`

## Extract the design tokens (copy verbatim from the prototypes)
These already exist in every `.dc.html` — lift them into Tailwind theme + CSS vars, do not reinvent:

```css
/* dark (default) */
--card:#141414; --raised:#1E1E1E; --border:#242424;
--text:#F5F5F5; --text2:#A1A1A6; --text3:#6B6B70;
--canvas:#0A0A0A; --line:rgba(255,255,255,.05); --track:rgba(255,255,255,.07);
/* light: data-theme="light" overrides (same var names) */
```
- **Font:** Manrope 400–800 (Google Fonts), set as Tailwind `fontFamily.sans`.
- **Accent system:** CSS var `--accent`, default `#A8E831`; swappable set `#A8E831 #7C83F5 #F472B6 #4ADE80 #FBBF24`. Stored in `uiStore`, applied at the root element style. The prototypes already drive everything off `var(--accent)` — preserve that.
- **Theme:** `data-theme="dark|light"` on root, toggled from `uiStore`, persisted to `localStorage`, default to `prefers-color-scheme`.
- **Status colors** (from Inbox mock data): AI handling → `var(--accent)`, Needs human → `#FBBF24`, Resolved → `#4ADE80`. Centralize in `lib/tokens.ts`.

## Build the shared atoms (`components/ui/`)
Pull the repeated prototype patterns into typed components — each appears in 3+ pages:
- `StatCard` — the 25–28px bold number + label tile (Dashboard, Products, Contacts, Agents, Integrations all use it)
- `ConfidencePill` + `ConfidenceBar` — the `88%` pill and the 70px progress bar (Inbox)
- `StatusDot` — colored dot + label
- `SegmentedControl` — the dark/light + filter-tab control
- `Avatar` — gradient initials circle
- `Badge`, `Button` (accent / ghost / danger variants), `Modal`, `Skeleton`

## Definition of Done
- `npm run dev` proxies to Spring Boot; `npm run build` is TS-clean
- Dark/light toggle + accent switch work globally off the extracted tokens
- All atoms above render in a scratch `/styleguide` route matching the prototype look
