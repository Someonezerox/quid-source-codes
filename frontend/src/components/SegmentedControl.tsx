import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface Segment<T extends string> {
  value: T
  label: ReactNode
}

interface SegmentedControlProps<T extends string> {
  segments: Segment<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

/** Pill segmented control — theme toggle, inbox filters, agent status tabs. */
export function SegmentedControl<T extends string>({ segments, value, onChange, className }: SegmentedControlProps<T>) {
  return (
    <div className={cn('inline-flex gap-0.5 rounded-[9px] border border-border bg-raised p-[3px]', className)}>
      {segments.map((s) => {
        const on = s.value === value
        return (
          <button
            key={s.value}
            type="button"
            onClick={() => onChange(s.value)}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-[7px] px-3 py-1.5 text-[12.5px] transition-colors',
              on ? 'bg-border font-bold text-foreground' : 'font-semibold text-muted-foreground hover:text-foreground',
            )}
          >
            {s.label}
          </button>
        )
      })}
    </div>
  )
}
