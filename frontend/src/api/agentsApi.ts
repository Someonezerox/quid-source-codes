import { api } from './client'
import type {
  AgentDetailResponse,
  AgentLearningResponse,
  AgentRequest,
  AgentResponse,
  ChannelResponse,
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

export async function listChannels(): Promise<ChannelResponse[]> {
  const { data } = await api.get<ChannelResponse[]>('/channels')
  return data
}

export async function assignAgentToChannel(agentId: number, channelId: number): Promise<void> {
  await api.put(`/agents/${agentId}/channels/${channelId}`)
}

// --- Telegram userbot connect (drives the Telethon sidecar) ---

export async function sendUserbotCode(phone: string): Promise<{ phoneCodeHash: string }> {
  const { data } = await api.post<{ phoneCodeHash: string }>('/userbot/send-code', { phone })
  return data
}

export interface UserbotSignInBody {
  phone: string
  code: string
  phoneCodeHash: string
  password?: string
  channelName?: string
}

/** On success creates + returns the new TELEGRAM_USERBOT channel. 409 → 2FA password needed, 400 → bad code. */
export async function userbotSignIn(body: UserbotSignInBody): Promise<ChannelResponse> {
  const { data } = await api.post<ChannelResponse>('/userbot/sign-in', body)
  return data
}

export interface UserbotGroup {
  id: number
  title: string
}

/** Telegram groups the userbot account belongs to (the channel must have a live session). */
export async function listUserbotGroups(channelId: number): Promise<UserbotGroup[]> {
  const { data } = await api.get<UserbotGroup[]>(`/userbot/channels/${channelId}/groups`)
  return data
}

/** Point the userbot at a group (null → DMs only). */
export async function setUserbotGroup(channelId: number, chatId: number | null): Promise<void> {
  await api.put(`/userbot/channels/${channelId}/group`, { chatId })
}

export async function getLearning(id: number): Promise<AgentLearningResponse> {
  const { data } = await api.get<AgentLearningResponse>(`/agents/${id}/learning`)
  return data
}

// --- Knowledge (Agent → KnowledgeBase → entries) ---

export async function createKnowledgeBase(agentId: number, name: string): Promise<{ id: number; name: string }> {
  const { data } = await api.post('/knowledge/bases', { agentId, name })
  return data
}

export async function uploadKnowledgeDoc(kbId: number, file: File): Promise<KnowledgeEntryResponse[]> {
  const fd = new FormData()
  fd.append('file', file)
  const { data } = await api.post<KnowledgeEntryResponse[]>(`/knowledge/bases/${kbId}/upload`, fd)
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
