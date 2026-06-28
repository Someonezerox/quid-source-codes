import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore, type Role } from '@/store/authStore'

/** Single enforcement point for role-restricted routes. Redirects unauthorized roles to /inbox. */
export function RoleGuard({ allow }: { allow: Role[] }) {
  const user = useAuthStore((s) => s.user)
  if (user && !allow.includes(user.role)) {
    return <Navigate to="/inbox" replace />
  }
  return <Outlet />
}
