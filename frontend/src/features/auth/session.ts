import { useEffect } from 'react'
import { fetchMe, login, logoutApi, refreshTokens } from '@/api/authApi'
import { useAuthStore, type AuthUser, type Role } from '@/store/authStore'
import type { MeResponse } from '@/types/auth'

function toAuthUser(me: MeResponse): AuthUser {
  return { ...me, role: me.role as Role }
}

/** Email/password sign-in: tokens → /me → authed session. */
export async function signIn(email: string, password: string): Promise<void> {
  const tokens = await login(email, password)
  useAuthStore.getState().setTokens(tokens.accessToken, tokens.refreshToken)
  const me = await fetchMe()
  useAuthStore.getState().setSession(tokens.accessToken, tokens.refreshToken, toAuthUser(me))
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
    const tokens = await refreshTokens(rt)
    useAuthStore.getState().setTokens(tokens.accessToken, tokens.refreshToken)
    const me = await fetchMe()
    useAuthStore.getState().setSession(tokens.accessToken, tokens.refreshToken, toAuthUser(me))
  } catch {
    useAuthStore.getState().clear()
  }
}

export function useAuthBootstrap(): void {
  useEffect(() => {
    void bootstrapSession()
  }, [])
}
