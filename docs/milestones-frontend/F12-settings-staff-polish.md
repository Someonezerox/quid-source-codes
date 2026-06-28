# F12 — Settings, Staff & Production Polish

**Status:** TODO
**No dedicated prototype** — build in the F1 design system; Staff sub-page in the same table style as Agents/Contacts.

## Objective
Workspace settings, staff management (no prototype existed for it), and production hardening.

## Settings
- `features/settings/SettingsPage.tsx` — tabbed: **General · Staff · Appearance**.
- General: workspace name, current user, change password (if backend supports).
- Appearance: theme + accent picker (same controls already in the avatar menu, surfaced here too).

## Staff (sub-page of Settings)
ADMIN-only. Table reuses the Agents/Contacts table style.
- List: name, email, role badge, enabled/disabled (muted style for disabled), joined.
- **Invite** modal → `POST /api/staff/invite`; result step shows one-time `tempPassword` in a copyable block that **blocks dismissal until acknowledged** (not a toast — it's shown once).
- Delete with confirm → `DELETE /api/staff/{id}`.
- All invited users are `Role.AGENT` (backend rule) — no role dropdown. Not paginated (SMB scale).

## Polish (applies to every page)
- `components/ErrorBoundary.tsx` — per-route boundary; one broken page doesn't kill the shell.
- Toasts via Sonner (one `<Toaster/>` in AppShell); mutation `onError`/`onSuccess` call it.
- Loading **skeletons** + actionable **empty states** for every list ("No agents yet → Create your first agent").
- `403/404/500` route pages.
- `vite.config.ts`: route-level code splitting (`React.lazy` + `Suspense`), asset hashing, `VITE_API_BASE_URL` for prod backend.

## API contract
- `GET /api/staff`, `POST /api/staff/invite` → `{ tempPassword }`, `DELETE /api/staff/{id}`

## Definition of Done
- Settings tabs work; Staff invite surfaces tempPassword in a blocking step.
- Every list has skeleton + empty state; mutation failures toast.
- Render errors show recovery UI; ADMIN-only gating on Settings/Staff.
- `npm run build` initial JS < ~150KB gzipped.
