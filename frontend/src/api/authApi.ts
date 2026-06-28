import { api, publicApi } from './client'
import type { AuthTokens, MeResponse } from '@/types/auth'

export async function login(email: string, password: string): Promise<AuthTokens> {
  const { data } = await publicApi.post<AuthTokens>('/auth/login', { email, password })
  return data
}

export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  const { data } = await publicApi.post<AuthTokens>('/auth/refresh', { refreshToken })
  return data
}

export async function logoutApi(refreshToken: string): Promise<void> {
  await publicApi.post('/auth/logout', { refreshToken })
}

export async function fetchMe(): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>('/auth/me')
  return data
}
