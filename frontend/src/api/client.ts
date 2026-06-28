import axios, { type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'

/** Authenticated client — attaches the bearer token and recovers from 401 via refresh. */
export const api = axios.create({ baseURL: '/api' })

/** Bare client for the token endpoints themselves (no interceptors → no recursion). */
export const publicApi = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// One refresh in flight at a time; concurrent 401s await the same promise.
let refreshing: Promise<string | null> | null = null

async function doRefresh(): Promise<string | null> {
  const rt = useAuthStore.getState().refreshToken
  if (!rt) return null
  try {
    const { data } = await publicApi.post('/auth/refresh', { refreshToken: rt })
    useAuthStore.getState().setTokens(data.accessToken, data.refreshToken)
    return data.accessToken
  } catch {
    useAuthStore.getState().clear()
    return null
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (error.response?.status !== 401 || original._retry) throw error
    original._retry = true
    if (!refreshing) refreshing = doRefresh().finally(() => (refreshing = null))
    const newToken = await refreshing
    if (!newToken) throw error
    original.headers.Authorization = `Bearer ${newToken}`
    return api(original)
  },
)
