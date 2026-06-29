// Mirrors backend org.example.quid.agent.dto.* and knowledge.dto.* (1:1, see F0).

export interface AgentResponse {
  id: number
  name: string
  description: string | null
  model: string | null
  confidenceThreshold: number
  active: boolean
  createdAt: string
  totalConversations: number
  avgConfidenceScore: number | null
}

export interface AgentRequest {
  name: string
  description?: string
  systemPrompt: string
  model?: string
  confidenceThreshold: number
}

export interface AgentLearningResponse {
  totalHandled: number
  resolvedByAi: number
  resolutionRate: number
  avgConfidenceScore: number | null
}

export interface KnowledgeBaseResponse {
  id: number
  agentId: number
  name: string
  createdAt: string
}

export interface ChannelResponse {
  id: number
  name: string
  type: string
  active: boolean
  assignedAgentId: number | null
  allowedChatId: number | null
  createdAt: string
}

export interface AgentDetailResponse {
  agent: AgentResponse
  systemPrompt: string
  knowledgeBases: KnowledgeBaseResponse[]
  assignedChannels: ChannelResponse[]
}

export interface KnowledgeEntryResponse {
  id: number
  title: string
  content: string
  embedded: boolean
  createdAt: string
}
