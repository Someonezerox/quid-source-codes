import { AVATAR_GRADIENTS } from './tokens'

/** "Maria Kovács" → "MK"; single word → first two letters. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** Stable `linear-gradient(...)` for a seed (customer/agent id), so avatars stay consistent. */
export function gradientFor(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  const [a, b] = AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length]
  return `linear-gradient(135deg, ${a}, ${b})`
}

/** Compact short relative time: "now", "2m", "5h", "3d". */
export function relativeTime(date: string | number | Date): string {
  const then = new Date(date).getTime()
  const mins = Math.floor((Date.now() - then) / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

/** 48211 → "48.2k". */
export function compact(n: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

/** 0..1 → "88%". */
export function percent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`
}

/**
 * Confidence color tier, relative to the agent's threshold:
 * at/above threshold → resolved green; within 0.8× → human amber; below → faint text.
 */
export function confColor(score: number, threshold = 0.7): string {
  if (score >= threshold) return 'var(--status-resolved)'
  if (score >= threshold * 0.8) return 'var(--status-human)'
  return 'var(--text-3)'
}
