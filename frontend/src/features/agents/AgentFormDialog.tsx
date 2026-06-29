import { useState, type ReactNode } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { useCreateAgent, useUpdateAgent } from './hooks'
import type { AgentDetailResponse } from '@/types/agents'

interface Props {
  trigger: ReactNode
  /** present = edit mode */
  existing?: AgentDetailResponse
}

export function AgentFormDialog({ trigger, existing }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(existing?.agent.name ?? '')
  const [description, setDescription] = useState(existing?.agent.description ?? '')
  const [systemPrompt, setSystemPrompt] = useState(existing?.systemPrompt ?? '')
  const [threshold, setThreshold] = useState(Math.round((existing?.agent.confidenceThreshold ?? 0.7) * 100))
  const [error, setError] = useState<string | null>(null)

  const create = useCreateAgent()
  const update = useUpdateAgent(existing?.agent.id ?? 0)
  const mutation = existing ? update : create
  const busy = mutation.isPending

  async function submit() {
    setError(null)
    try {
      await mutation.mutateAsync({
        name,
        description: description || undefined,
        systemPrompt,
        confidenceThreshold: threshold / 100,
      })
      setOpen(false)
    } catch {
      setError('Could not save the agent. Check the fields and try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{existing ? 'Edit agent' : 'New AI agent'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Support Bot" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desc">Description</Label>
            <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Handles order & shipping questions" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prompt">System prompt</Label>
            <Textarea
              id="prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={5}
              className="font-mono text-[13px]"
              placeholder="You are a helpful support assistant for..."
            />
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label>Confidence threshold</Label>
              <span className="text-[13px] font-bold text-primary">{threshold}%</span>
            </div>
            <Slider value={[threshold]} onValueChange={(v) => setThreshold(v[0])} min={0} max={100} step={1} />
            <p className="text-[11.5px] text-text-3">Below this, the AI hands off to a human.</p>
          </div>
          {error && <p className="text-[12.5px] font-semibold text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy || !name || !systemPrompt}>
            {busy ? 'Saving…' : existing ? 'Save changes' : 'Create agent'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
