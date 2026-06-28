import { cn } from '@/lib/utils'
import { initials as toInitials, gradientFor } from '@/lib/format'

interface AvatarProps {
  name: string
  seed?: string
  size?: number
  className?: string
}

/** Gradient initials circle. Gradient is derived deterministically from `seed` (defaults to name). */
export function Avatar({ name, seed, size = 38, className }: AvatarProps) {
  return (
    <div
      className={cn('flex shrink-0 items-center justify-center rounded-full font-extrabold text-[#0A0A0A]', className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.34,
        background: gradientFor(seed ?? name),
      }}
    >
      {toInitials(name)}
    </div>
  )
}
