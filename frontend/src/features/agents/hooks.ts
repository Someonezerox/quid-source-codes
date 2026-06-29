import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAgent,
  createEntry,
  createKnowledgeBase,
  deactivateAgent,
  deleteEntry,
  getAgent,
  getLearning,
  listAgents,
  listEntries,
  updateAgent,
} from '@/api/agentsApi'
import type { AgentRequest } from '@/types/agents'

export function useAgents() {
  return useQuery({ queryKey: ['agents'], queryFn: listAgents })
}

export function useAgent(id: number, enabled = true) {
  return useQuery({ queryKey: ['agents', id], queryFn: () => getAgent(id), enabled: enabled && id > 0 })
}

export function useAgentLearning(id: number) {
  return useQuery({ queryKey: ['agents', id, 'learning'], queryFn: () => getLearning(id) })
}

export function useCreateAgent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: AgentRequest) => createAgent(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agents'] }),
  })
}

export function useUpdateAgent(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: AgentRequest) => updateAgent(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agents'] })
      qc.invalidateQueries({ queryKey: ['agents', id] })
    },
  })
}

export function useDeactivateAgent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deactivateAgent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agents'] }),
  })
}

// --- Knowledge ---

export function useEntries(kbId: number | undefined) {
  return useQuery({
    queryKey: ['kb', kbId, 'entries'],
    queryFn: () => listEntries(kbId as number),
    enabled: kbId != null,
  })
}

export function useCreateKnowledgeBase(agentId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => createKnowledgeBase(agentId, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agents', agentId] }),
  })
}

export function useCreateEntry(kbId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ title, content }: { title: string; content: string }) => createEntry(kbId, title, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kb', kbId, 'entries'] }),
  })
}

export function useDeleteEntry(kbId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (entryId: number) => deleteEntry(kbId, entryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kb', kbId, 'entries'] }),
  })
}
