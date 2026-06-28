import { create } from 'zustand'

export type Role = 'ADMIN' | 'AGENT'

export interface AuthUser {
  accessToken: string
  userId: string
  userName: string
  role: Role
  workspaceId: string
  workspaceName: string
}

interface AuthState {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  logout: () => void
}

// Access token lives in memory only (see F0/F3). Refresh token is an httpOnly cookie.
export const useAuthStore = create<AuthState>((set) => ({
  // ponytail: dev seed so the shell is viewable before F3 login exists. Remove when F3 lands.
  user: {
    accessToken: 'dev',
    userId: 'dev-user',
    userName: 'My Workspace',
    role: 'ADMIN',
    workspaceId: 'dev-ws',
    workspaceName: 'My Workspace',
  },
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}))
