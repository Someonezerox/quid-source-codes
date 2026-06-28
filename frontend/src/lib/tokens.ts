// Design tokens shared across features. Mirrors the prototype's color system.
// Status colors resolve to CSS vars defined in index.css so they follow the theme.

export type ConversationStatus = 'AI_HANDLING' | 'NEEDS_HUMAN' | 'RESOLVED'

export const STATUS_LABEL: Record<ConversationStatus, string> = {
  AI_HANDLING: 'AI handling',
  NEEDS_HUMAN: 'Needs human',
  RESOLVED: 'Resolved',
}

export const STATUS_COLOR: Record<ConversationStatus, string> = {
  AI_HANDLING: 'var(--status-ai)',
  NEEDS_HUMAN: 'var(--status-human)',
  RESOLVED: 'var(--status-resolved)',
}

// Accent palette offered in the workspace menu (prototype's swatch set). First = default.
export const ACCENTS = ['#A8E831', '#7C83F5', '#F472B6', '#4ADE80', '#FBBF24'] as const
export type Accent = (typeof ACCENTS)[number]

// Avatar gradient pairs, picked deterministically per entity id (see gradientFor).
export const AVATAR_GRADIENTS = [
  ['#FB923C', '#FBBF24'],
  ['#7C83F5', '#F472B6'],
  ['#4ADE80', '#2DD4BF'],
  ['#F472B6', '#7C83F5'],
  ['#FBBF24', '#FB923C'],
  ['#2DD4BF', '#A8E831'],
] as const
