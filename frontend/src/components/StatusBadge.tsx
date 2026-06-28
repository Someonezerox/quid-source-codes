import { cn } from '@/lib/utils'
import { STATUS_COLOR, STATUS_LABEL, type ConversationStatus } from '@/lib/tokens'

/** Colored dot + label for a conversation status (list rows). */
export function StatusDot({ status, className }: { status: ConversationStatus; className?: string }) {
  const color = STATUS_COLOR[status]
  return (
    <span className={cn('flex items-center gap-1.5 text-[11px] font-bold', className)} style={{ color }}>
      <span className="size-1.5 rounded-full" style={{ background: color }} />
      {STATUS_LABEL[status]}
    </span>
  )
}

/** Pill variant with tinted background (thread header). */
export function StatusPill({ status, className }: { status: ConversationStatus; className?: string }) {
  const color = STATUS_COLOR[status]
  return (
    <span
      className={cn('flex items-center gap-1.5 rounded-[10px] border px-3 py-1.5 text-[12.5px] font-bold', className)}
      style={{ color, background: `color-mix(in srgb, ${color} 10%, transparent)`, borderColor: `color-mix(in srgb, ${color} 22%, transparent)` }}
    >
      <span className="size-[7px] rounded-full" style={{ background: color }} />
      {STATUS_LABEL[status]}
    </span>
  )
}
