import { api } from './client'
import type {
  AgentDetailResponse,
  AgentLearningResponse,
  AgentRequest,
  AgentResponse,
  KnowledgeEntryResponse,
} from '@/types/agents'

export async function listAgents(): Promise<AgentResponse[]> {
  const { data } = await api.get<AgentResponse[]>('/agents')
  return data
}

export async function getAgent(id: number): Promise<AgentDetailResponse> {
  const { data } = await api.get<AgentDetailResponse>(`/agents/${id}`)
  return data
}

export async function createAgent(body: AgentRequest): Promise<AgentResponse> {
  const { data } = await api.post<AgentResponse>('/agents', body)
  return data
}

export async function updateAgent(id: number, body: AgentRequest): Promise<AgentResponse> {
  const { data } = await api.put<AgentResponse>(`/agents/${id}`, body)
  return data
}

export async function deactivateAgent(id: number): Promise<void> {
  await api.delete(`/agents/${id}`)
}

export async function getLearning(id: number): Promise<AgentLearningResponse> {
  const { data } = await api.get<AgentLearningResponse>(`/agents/${id}/learning`)
  return data
}

// --- Knowledge (Agent → KnowledgeBase → entries) ---

export async function createKnowledgeBase(agentId: number, name: string) {
  const { data } = await api.post('/knowledge/bases', { agentId, name })
  return data
}

export async function deleteKnowledgeBase(id: number): Promise<void> {
  await api.delete(`/knowledge/bases/${id}`)
}

export async function listEntries(kbId: number): Promise<KnowledgeEntryResponse[]> {
  const { data } = await api.get<KnowledgeEntryResponse[]>(`/knowledge/bases/${kbId}/entries`)
  return data
}

export async function createEntry(kbId: number, title: string, content: string): Promise<KnowledgeEntryResponse> {
  const { data } = await api.post<KnowledgeEntryResponse>(`/knowledge/bases/${kbId}/entries`, { title, content })
  return data
}

export async function deleteEntry(kbId: number, entryId: number): Promise<void> {
  await api.delete(`/knowledge/bases/${kbId}/entries/${entryId}`)
}
