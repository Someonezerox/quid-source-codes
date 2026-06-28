import { Bot, LayoutDashboard, MessageSquare, Plug, BarChart3, Users, type LucideIcon } from 'lucide-react'
import type { Role } from '@/store/authStore'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  roles: Role[]
}

// Single source of truth for sidebar links AND route guards (F2). Order = sidebar order.
export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'AGENT'] },
  { to: '/inbox', label: 'Inbox', icon: MessageSquare, roles: ['ADMIN', 'AGENT'] },
  { to: '/usage', label: 'Usage', icon: BarChart3, roles: ['ADMIN'] },
  { to: '/contacts', label: 'Contacts', icon: Users, roles: ['ADMIN', 'AGENT'] },
  { to: '/agents', label: 'Agents', icon: Bot, roles: ['ADMIN'] },
  { to: '/integrations', label: 'Integrations', icon: Plug, roles: ['ADMIN'] },
]

export function canAccess(roles: Role[], role: Role): boolean {
  return roles.includes(role)
}
