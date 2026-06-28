import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

/** Gate: waits for session bootstrap, then routes anon users to /login (preserving target). */
export function ProtectedRoute() {
  const status = useAuthStore((s) => s.status)
  const location = useLocation()

  if (status === 'loading') {
    return <div className="grid h-screen place-items-center bg-canvas text-sm text-muted-foreground">Loading…</div>
  }
  if (status === 'anon') {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <Outlet />
}
