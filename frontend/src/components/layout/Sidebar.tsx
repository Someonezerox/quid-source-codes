import { NavLink } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/router/nav'
import { useAuthStore } from '@/store/authStore'
import { WorkspaceMenu } from './WorkspaceMenu'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex w-full flex-col items-center gap-1.5 py-0.5 text-[11px] font-semibold transition-colors',
    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
  )

/** 78px icon rail ported from the prototype. Nav items are role-gated. */
export function Sidebar() {
  const role = useAuthStore((s) => s.user?.role)
  const items = NAV_ITEMS.filter((i) => !role || i.roles.includes(role))

  return (
    <aside className="flex h-full w-[78px] shrink-0 flex-col items-center border-r border-border bg-sidebar px-0 py-6">
      <div className="mb-8 flex flex-col items-center gap-1.5">
        <div className="grid size-9 place-items-center rounded-[10px] bg-primary text-primary-foreground">
          <span className="text-base font-extrabold">Q</span>
        </div>
        <span className="text-[12px] font-extrabold tracking-tight">QUID</span>
      </div>

      <nav className="flex w-full flex-col items-center gap-[22px]">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass}>
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="flex-1" />

      <div className="flex w-full flex-col items-center gap-6">
        {(!role || role === 'ADMIN') && (
          <NavLink to="/settings" className={linkClass}>
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
        )}
        <WorkspaceMenu />
      </div>
    </aside>
  )
}
