import { useEffect } from 'react'
import { fetchMe, login, logoutApi, refreshTokens, register } from '@/api/authApi'
import { useAuthStore, type AuthUser, type Role } from '@/store/authStore'
import type { AuthTokens, MeResponse } from '@/types/auth'

function toAuthUser(me: MeResponse): AuthUser {
  return { ...me, role: me.role as Role }
}

/** Tokens → /me → authed session. Shared by sign-in and sign-up. */
async function establish(tokens: AuthTokens): Promise<void> {
  useAuthStore.getState().setTokens(tokens.accessToken, tokens.refreshToken)
  const me = await fetchMe()
  useAuthStore.getState().setSession(tokens.accessToken, tokens.refreshToken, toAuthUser(me))
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
