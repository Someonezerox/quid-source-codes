# M12 — Google OAuth (Backend)

**Status:** TODO
**Pairs with frontend F3.** Adds "Continue with Google" alongside the existing email/password auth.

## Objective
Let users sign in with Google, reusing the existing JWT + Workspace model. No second auth system — Google is just another way to mint the same access/refresh tokens.

## Scope
- Add `spring-boot-starter-oauth2-client`.
- Config `app.oauth.google.*` (clientId, clientSecret, redirectUri) via env, per existing profile setup.
- Endpoints:
  - `GET /api/auth/google` → redirect to Google consent.
  - `GET /api/auth/google/callback` → exchange code, fetch profile (email, name, sub), then:
    - **Existing user** (match by email + workspace) → issue tokens.
    - **New user** → follow current register semantics: first Google sign-in **creates a workspace + ADMIN** (same as `/api/auth/register`); invited staff who later use Google match their existing `User`.
  - Issue the **same** access token (memory) + refresh token (httpOnly cookie) as password login, then redirect to frontend `/auth/callback`.

## Architectural decisions
- **Reuse `JwtService` / refresh-token storage** — Google only replaces the credential check, not the token lifecycle. One token format for both flows.
- **`User` gains `authProvider` (`LOCAL` | `GOOGLE`) + nullable `googleSub`** — so a Google account can't be brute-forced via the password endpoint, and vice versa. Password is null for GOOGLE users.
- **Email is the identity key** within a workspace (already unique). Google `sub` stored for stable re-linking if email changes.
- **No account-linking UI in v1** — if a LOCAL email later signs in with Google, reject with a clear 409 ("use password sign-in"). YAGNI; revisit if users ask.

## Definition of Done
- Google sign-in creates a workspace+ADMIN on first use, or logs an existing user in.
- Tokens identical in shape to password login; refresh works.
- `authProvider` enforced (no cross-provider login on one account).
