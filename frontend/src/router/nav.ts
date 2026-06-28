import type { ComponentType } from 'react'
import { AgentsIcon, ContactsIcon, DashboardIcon, InboxIcon, IntegrationsIcon, ProductsIcon } from '@/components/icons'
import type { Role } from '@/store/authStore'

export interface NavItem {
  to: string
  label: string
  icon: ComponentType<{ size?: number; className?: string }>
  roles: Role[]
}

// Single source of truth for sidebar links AND route guards (F2). Order = sidebar order.
export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon, roles: ['ADMIN', 'AGENT'] },
  { to: '/inbox', label: 'Inbox', icon: InboxIcon, roles: ['ADMIN', 'AGENT'] },
  { to: '/products', label: 'Products', icon: ProductsIcon, roles: ['ADMIN', 'AGENT'] },
  { to: '/contacts', label: 'Contacts', icon: ContactsIcon, roles: ['ADMIN', 'AGENT'] },
  { to: '/agents', label: 'Agents', icon: AgentsIcon, roles: ['ADMIN'] },
  { to: '/integrations', label: 'Integrations', icon: IntegrationsIcon, roles: ['ADMIN'] },
]

export function canAccess(roles: Role[], role: Role): boolean {
  return roles.includes(role)
}
