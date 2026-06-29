import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar } from '@/components/Avatar'
import { StatCard } from '@/components/StatCard'
import { percent } from '@/lib/format'
import {
  useAgent,
  useAgentLearning,
  useCreateEntry,
  useCreateKnowledgeBase,
  useDeleteEntry,
  useEntries,
} from './hooks'
import { AgentFormDialog } from './AgentFormDialog'
import type { KnowledgeBaseResponse } from '@/types/agents'

export default function AgentDetailPage() {
  const { id } = useParams()
  const agentId = Number(id)
  const navigate = useNavigate()
  const { data: detail, isLoading } = useAgent(agentId)
  const { data: learning } = useAgentLearning(agentId)
  const createBase = useCreateKnowledgeBase(agentId)

  if (isLoading || !detail) {
    return (
      <div className="space-y-4 p-7">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  const { agent, systemPrompt, knowledgeBases } = detail

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-border px-7 py-[18px]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/agents')} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft size={18} />
          </button>
          <Avatar name={agent.name} seed={`agent-${agent.id}`} size={36} />
          <div>
            <div className="text-[17px] font-extrabold tracking-tight">{agent.name}</div>
            <div className="text-[12.5px] text-text-3">{agent.active ? 'Active' : 'Inactive'}</div>
          </div>
        </div>
        <AgentFormDialog existing={detail} trigger={<Button variant="secondary">Edit</Button>} />
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto p-7">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Threshold" value={percent(agent.confidenceThreshold)} />
          <StatCard label="Handled" value={learning?.totalHandled ?? '—'} tint="#7C83F5" />
          <StatCard label="Resolved by AI" value={learning?.resolvedByAi ?? '—'} tint="#4ADE80" />
          <StatCard
            label="Resolution rate"
            value={learning ? percent(learning.resolutionRate) : '—'}
            tint="#FBBF24"
          />
        </div>

        <section className="space-y-2">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.05em] text-text-3">System prompt</h2>
          <div className="whitespace-pre-wrap rounded-[14px] border border-border bg-card p-4 font-mono text-[13px] leading-relaxed">
            {systemPrompt || <span className="text-text-3">No system prompt set.</span>}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.05em] text-text-3">Knowledge bases</h2>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              disabled={createBase.isPending}
              onClick={() => createBase.mutate('Knowledge Base')}
            >
              <Plus size={15} />
              Add base
            </Button>
          </div>
          {knowledgeBases.length === 0 ? (
            <div className="rounded-[14px] border border-dashed border-border p-6 text-center text-[13px] text-text-3">
              No knowledge base yet. Add one to give this agent facts to answer from.
            </div>
          ) : (
            knowledgeBases.map((kb) => <KnowledgeBaseCard key={kb.id} kb={kb} />)
          )}
        </section>
      </div>
    </div>
  )
}

function KnowledgeBaseCard({ kb }: { kb: KnowledgeBaseResponse }) {
  const { data: entries } = useEntries(kb.id)
  const createEntry = useCreateEntry(kb.id)
  const deleteEntry = useDeleteEntry(kb.id)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  function add() {
    if (!title || !content) return
    createEntry.mutate(
      { title, content },
      {
        onSuccess: () => {
          setTitle('')
          setContent('')
        },
      },
    )
  }

  return (
    <div className="rounded-[14px] border border-border bg-card">
      <div className="border-b border-border px-4 py-3 text-[13.5px] font-bold">{kb.name}</div>
      <div className="divide-y divide-border">
        {(entries ?? []).map((e) => (
          <div key={e.id} className="flex items-start justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[13.5px] font-semibold">
                {e.title}
                {!e.embedded && <span className="text-[10px] font-bold text-status-human">indexing…</span>}
              </div>
              <div className="truncate text-[12.5px] text-text-3">{e.content}</div>
            </div>
            <button onClick={() => deleteEntry.mutate(e.id)} className="text-text-3 hover:text-destructive">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
      <div className="space-y-2 border-t border-border p-4">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Entry title" />
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={2} placeholder="Content the AI can answer from…" />
        <Button size="sm" className="gap-1.5" disabled={!title || !content || createEntry.isPending} onClick={add}>
          <Plus size={15} />
          Add entry
        </Button>
      </div>
    </div>
  )
}
