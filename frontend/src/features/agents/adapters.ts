import type { AgentResponse } from '@/types/agents'
import { gradientFor, percent } from '@/lib/format'

export interface AgentRowVM {
  id: number
  name: string
  description: string
  avatarSeed: string
  active: boolean
  statusLabel: string
  statusColor: string
  conversations: number
  confidence: string
  confidenceColor: string
}

export function toAgentRow(a: AgentResponse): AgentRowVM {
  return {
    id: a.id,
    name: a.name,
    description: a.description ?? '',
    avatarSeed: `agent-${a.id}`,
    active: a.active,
    statusLabel: a.active ? 'Active' : 'Inactive',
    statusColor: a.active ? 'var(--status-resolved)' : 'var(--text-3)',
    conversations: a.totalConversations,
    confidence: a.avgConfidenceScore != null ? percent(a.avgConfidenceScore) : '—',
    confidenceColor: a.avgConfidenceScore != null ? 'var(--foreground)' : 'var(--text-3)',
  }
}

export function gradientForAgent(id: number): string {
  return gradientFor(`agent-${id}`)
}

export interface AgentStatsVM {
  total: number
  active: number
  conversations: number
  avgConfidence: string
}

export function toAgentStats(agents: AgentResponse[]): AgentStatsVM {
  const withScore = agents.filter((a) => a.avgConfidenceScore != null)
  const avg =
    withScore.length > 0
      ? withScore.reduce((s, a) => s + (a.avgConfidenceScore ?? 0), 0) / withScore.length
      : null
  return {
    total: agents.length,
    active: agents.filter((a) => a.active).length,
    conversations: agents.reduce((s, a) => s + a.totalConversations, 0),
    avgConfidence: avg != null ? percent(avg) : '—',
  }
}
