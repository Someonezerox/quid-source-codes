import { useEffect } from 'react'
import { fetchMe, login, logoutApi, refreshTokens, register } from '@/api/authApi'
import { useAuthStore, type AuthUser, type Role } from '@/store/authStore'
import type { AuthTokens, MeResponse } from '@/types/auth'

function toAuthUser(me: MeResponse): AuthUser {
  return { ...me, role: me.role as Role }
}

/** Read the `sub` (email) claim from a JWT without verifying it (display only). */
function jwtSubject(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.sub ?? null
  } catch {
    return null
  }
}

// ponytail: fallback session when the backend has no /api/auth/me yet (older running instance).
// Role defaults to ADMIN for nav only — every API call is still authorized server-side by the JWT.
// Drop this once the backend with /me is deployed.
function fallbackUser(accessToken: string): AuthUser {
  const email = jwtSubject(accessToken) ?? 'user@quid.app'
  return { id: 0, email, fullName: email, role: 'ADMIN', workspaceId: 0, workspaceName: email.split('@')[0] }
}

/** Tokens → /me → authed session. Shared by sign-in and sign-up. */
async function establish(tokens: AuthTokens): Promise<void> {
  useAuthStore.getState().setTokens(tokens.accessToken, tokens.refreshToken)
  let user: AuthUser
  try {
    user = toAuthUser(await fetchMe())
  } catch {
    user = fallbackUser(tokens.accessToken)
  }
  useAuthStore.getState().setSession(tokens.accessToken, tokens.refreshToken, user)
}

export async function signIn(email: string, password: string): Promise<void> {
  await establish(await login(email, password))
}

/** Create a workspace + ADMIN account, then sign in. */
export async function signUp(email: string, password: string, fullName: string): Promise<void> {
  await establish(await register(email, password, fullName))
}

export function signOut(): void {
  const rt = useAuthStore.getState().refreshToken
  useAuthStore.getState().clear()
  if (rt) logoutApi(rt).catch(() => {}) // best-effort revoke
}

/** On app load: recover the session from the persisted refresh token, or fall back to anon. */
export async function bootstrapSession(): Promise<void> {
  const rt = useAuthStore.getState().refreshToken
  if (!rt) {
    useAuthStore.getState().setStatus('anon')
    return
  }
  try {
    await establish(await refreshTokens(rt))
  } catch {
    useAuthStore.getState().clear()
  }
}

export function useAuthBootstrap(): void {
  useEffect(() => {
    void bootstrapSession()
  }, [])
}
