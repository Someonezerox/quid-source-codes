import { cn } from '@/lib/utils'
import { confColor, percent } from '@/lib/format'

/** Small percentage pill colored by tier vs the agent threshold. */
export function ConfidencePill({ score, threshold, className }: { score: number; threshold?: number; className?: string }) {
  return (
    <span className={cn('text-[11.5px] font-extrabold', className)} style={{ color: confColor(score, threshold) }}>
      {percent(score)}
    </span>
  )
}

/** 70px progress bar + percentage, for AI message confidence (prototype thread). */
export function ConfidenceBar({ score, threshold, className }: { score: number; threshold?: number; className?: string }) {
  const color = confColor(score, threshold)
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className="text-[11px] font-semibold text-text-3">AI confidence</span>
      <div className="h-[5px] w-[70px] overflow-hidden rounded bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)]">
        <div className="h-full rounded" style={{ width: percent(score), background: color }} />
      </div>
      <span className="text-[11.5px] font-extrabold" style={{ color }}>
        {percent(score)}
      </span>
    </div>
  )
}
