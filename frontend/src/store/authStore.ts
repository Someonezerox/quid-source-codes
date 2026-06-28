import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role = 'ADMIN' | 'AGENT'

export interface AuthUser {
  id: number
  email: string
  fullName: string
  role: Role
  workspaceId: number
  workspaceName: string
}

type Status = 'loading' | 'authed' | 'anon'

interface AuthState {
  accessToken: string | null // memory only
  refreshToken: string | null // persisted (backend returns it in the body, opaque, rotated on refresh)
  user: AuthUser | null
  status: Status
  setTokens: (accessToken: string, refreshToken: string) => void
  setSession: (accessToken: string, refreshToken: string, user: AuthUser) => void
  setStatus: (status: Status) => void
  clear: () => void
}

// ponytail: refresh token persisted in localStorage because the backend issues it in the
// response body, not an httpOnly cookie. Move to a cookie flow when the backend supports it.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      status: 'loading',
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setSession: (accessToken, refreshToken, user) => set({ accessToken, refreshToken, user, status: 'authed' }),
      setStatus: (status) => set({ status }),
      clear: () => set({ accessToken: null, refreshToken: null, user: null, status: 'anon' }),
    }),
    { name: 'quid-auth', partialize: (s) => ({ refreshToken: s.refreshToken }) },
  ),
)
