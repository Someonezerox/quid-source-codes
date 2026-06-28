import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: ReactNode
  icon?: ReactNode
  /** icon tint (css color); defaults to brand accent */
  tint?: string
  className?: string
}

/** Stat tile used across Dashboard, Usage, Contacts, Agents, Integrations. */
export function StatCard({ label, value, icon, tint = 'var(--primary)', className }: StatCardProps) {
  return (
    <div className={cn('flex items-center gap-3.5 rounded-[18px] border border-border bg-card p-[18px]', className)}>
      {icon && (
        <div
          className="grid size-[42px] shrink-0 place-items-center rounded-xl border"
          style={{ color: tint, background: `color-mix(in srgb, ${tint} 14%, transparent)`, borderColor: `color-mix(in srgb, ${tint} 28%, transparent)` }}
        >
          {icon}
        </div>
      )}
      <div>
        <div className="text-[12.5px] font-semibold text-muted-foreground">{label}</div>
        <div className="mt-0.5 text-[25px] font-extrabold tracking-tight">{value}</div>
      </div>
    </div>
  )
}
