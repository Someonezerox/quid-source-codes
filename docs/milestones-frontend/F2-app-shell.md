# F2 — App Shell & Navigation

**Status:** TODO
**Port from:** the `<aside>` sidebar block present in every `*.dc.html` (lines ~47–159 in `QUID Inbox.dc.html`).

## Objective
Port the prototype's 78px icon rail + workspace avatar menu into a real, route-aware shell that every page renders inside.

## What to build
- `components/layout/AppShell.tsx` — flex row: `Sidebar` + `<Outlet />` content area, `height:100vh`, `overflow:hidden` (matches prototype root).
- `components/layout/Sidebar.tsx` — port 1:1, keep the SVG icons from the prototype:
  - Nav: **Dashboard · Inbox · Products(→Usage) · Contacts · Agents · Integrations**, then **Settings** + workspace avatar pinned bottom.
  - Active state = accent color + the prototype's `.active` class behavior.
- `components/layout/WorkspaceMenu.tsx` — port the avatar popover: workspace name + role, dark/light segmented control (wired to `uiStore`), **Log out**.
- Notification dot on the avatar (prototype already shows the green presence dot) → repurpose as unread indicator, driven by F6 SSE.

## Design → API adaptation
- Prototype hardcodes workspace `"M" / "My Workspace" / "Admin"`. Replace with `authStore` values (`workspaceName`, `role`, derived initials).
- **Nav label change:** the prototype's `Products` item becomes `Usage` (see F9). Same icon slot, new label + route.
- Role-gate nav links (hide, don't disable):
  ```
  Dashboard, Inbox, Contacts → ADMIN + AGENT
  Usage, Agents, Integrations, Settings → ADMIN only
  ```

## Code structure
- `router/routes.tsx` — all routes nested under `AppShell`; each lazy-loaded (`React.lazy`).
- `router/ProtectedRoute.tsx` — redirect to `/login` if no token; recover via refresh (F3).
- `router/RoleGuard.tsx` — single enforcement point for ADMIN-only routes.

## Definition of Done
- Shell renders once; navigation swaps only the outlet (sidebar + SSE stay mounted).
- Theme/accent switch from the avatar menu works.
- AGENT role sees only permitted nav items.
- Visual match to the prototype sidebar in both themes.
