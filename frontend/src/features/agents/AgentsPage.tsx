import { useMemo, useState } from 'react'
import { Bot, CheckCircle2, MessageSquare, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlusIcon } from '@/components/icons'
import { StatCard } from '@/components/StatCard'
import { Avatar } from '@/components/Avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useAgents } from './hooks'
import { toAgentRow, toAgentStats } from './adapters'
import { AgentWizard } from './AgentWizard'

export default function AgentsPage() {
  const { data: agents, isLoading } = useAgents()
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)

  const stats = useMemo(() => (agents ? toAgentStats(agents) : null), [agents])
  const rows = useMemo(
    () => (agents ?? []).map(toAgentRow).filter((a) => a.name.toLowerCase().includes(search.toLowerCase())),
    [agents, search],
  )

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-border px-7 py-[18px]">
        <h1 className="text-[21px] font-extrabold tracking-tight">Agents</h1>
        <Button onClick={() => setAddOpen(true)}>
          <PlusIcon size={18} />
          New agent
        </Button>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto p-7">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total agents" value={stats?.total ?? '—'} icon={<Bot size={19} />} />
          <StatCard label="Active" value={stats?.active ?? '—'} icon={<CheckCircle2 size={19} />} tint="#4ADE80" />
          <StatCard label="Conversations" value={stats?.conversations ?? '—'} icon={<MessageSquare size={19} />} tint="#7C83F5" />
          <StatCard label="Avg confidence" value={stats?.avgConfidence ?? '—'} icon={<Bot size={19} />} tint="#FBBF24" />
        </div>

        <div className="rounded-[20px] border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <span className="text-[13.5px] font-bold">All agents</span>
            <div className="flex w-[230px] items-center gap-2.5 rounded-[9px] border border-border bg-raised px-3 py-2">
              <Search size={15} className="text-text-3" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search agents"
                className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3 p-5">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Bot size={28} className="text-text-3" />
              <div className="text-[14px] font-bold">No agents yet</div>
              <div className="text-[13px] text-muted-foreground">Create your first AI agent to start handling chats.</div>
              <Button className="mt-1" onClick={() => setAddOpen(true)}>
                <PlusIcon size={18} />
                New agent
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[2.2fr_1fr_1fr_1fr] gap-4 border-b-2 border-border px-5 py-3 text-[11px] font-bold uppercase tracking-[0.04em] text-text-3">
                <span>Agent</span>
                <span>Status</span>
                <span>Conversations</span>
                <span>Avg confidence</span>
              </div>
              {rows.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setEditId(a.id)}
                  className="grid w-full grid-cols-[2.2fr_1fr_1fr_1fr] items-center gap-4 border-b border-border px-5 py-3.5 text-left transition-colors last:border-0 hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={a.name} seed={a.avatarSeed} size={36} />
                    <div className="min-w-0">
                      <div className="truncate text-[14px] font-bold">{a.name}</div>
                      {a.description && <div className="truncate text-[12px] text-text-3">{a.description}</div>}
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-[12px] font-bold" style={{ color: a.statusColor }}>
                    <span className="size-1.5 rounded-full" style={{ background: a.statusColor }} />
                    {a.statusLabel}
                  </span>
                  <span className="text-[13.5px] font-semibold">{a.conversations}</span>
                  <span className="text-[13.5px] font-bold" style={{ color: a.confidenceColor }}>
                    {a.confidence}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      <AgentWizard open={addOpen} onOpenChange={setAddOpen} />
      <AgentWizard open={editId != null} onOpenChange={(o) => !o && setEditId(null)} agentId={editId ?? undefined} />
    </div>
  )
}
