# F3 — Auth: Email/Password + Google OAuth (Frontend)

**Status:** TODO
**No prototype exists** — build the Login page in the F1 design system (Manrope, tokens, accent button). Backend Google OAuth is milestone **B1** (`milestones-backend`), do that first / in parallel.

## Objective
Bulletproof JWT auth with silent refresh, plus "Continue with Google" — both wired to the backend.

## What to build
- `features/auth/LoginPage.tsx` — centered card on `--canvas`: logo, email + password, accent "Sign in" button, **"Continue with Google"** button, error states.
- `api/client.ts` — single axios instance:
  - Request interceptor: inject `Authorization: Bearer <token>` from `authStore`.
  - Response interceptor: on 401 → `POST /api/auth/refresh` (httpOnly cookie), update token, retry **once**; second 401 → clear store + `/login`. Guard with an `isRefreshing` flag + pending-request queue so concurrent 401s fire one refresh.
- `store/authStore.ts` — Zustand: `{ accessToken, workspaceId, workspaceName, userId, role }`. Access token **in memory only**.
- **Google OAuth flow:** button → redirect to backend `GET /api/auth/google` → backend handles OAuth → redirects back to `/auth/callback?token=...` (or sets cookie) → `features/auth/OAuthCallback.tsx` reads it, hydrates `authStore`, navigates to `/inbox`.
- Logout → `POST /api/auth/logout` + clear store + `/login`.

## Design → API adaptation
- `POST /api/auth/login` → `{ accessToken, workspaceId, workspaceName, userId, role }` (adapter maps into `authStore`).
- Refresh token in **httpOnly cookie** set by backend — frontend never reads it; XSS-safe.
- On hard reload with empty memory, first protected API call's 401 triggers refresh → session recovers silently.

## Definition of Done
- Email/password login → `/inbox`.
- "Continue with Google" completes round-trip and lands authenticated.
- Token auto-refreshes transparently; deep-link while logged-out → `/login` → back to original URL.
- AGENT cannot reach ADMIN routes (RoleGuard).
