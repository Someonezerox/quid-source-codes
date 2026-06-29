import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ChevronDown, Send, Shield, Upload } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAgent, useCreateAgent, useUpdateAgent } from './hooks'

type Model = 'gpt' | 'claude' | 'llama'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** present → edit mode (jumps to the config step, pre-filled) */
  agentId?: number
}

const STEP_META: Record<number, { title: string; desc: string }> = {
  1: { title: 'Connect Telegram', desc: 'Link your Telegram account as a userbot.' },
  2: { title: 'Verify code', desc: 'Enter the code sent to your Telegram app.' },
  3: { title: 'Two-step verification', desc: 'This account has an additional cloud password.' },
  4: { title: 'Add agent', desc: 'Spin up an AI bot for your inbox.' },
}

export function AgentWizard({ open, onOpenChange, agentId }: Props) {
  const editing = agentId != null
  const { data: detail } = useAgent(agentId ?? 0)
  const create = useCreateAgent()
  const update = useUpdateAgent(agentId ?? 0)

  const [step, setStep] = useState(editing ? 4 : 1)
  const [name, setName] = useState('')
  const [handle, setHandle] = useState('')
  const [model, setModel] = useState<Model>('gpt')
  const [persona, setPersona] = useState('')
  const [ks, setKs] = useState({ products: true, faq: true, orders: false })
  const [error, setError] = useState<string | null>(null)

  // (re)seed when opening, and prefill in edit mode once the detail loads
  useEffect(() => {
    if (!open) return
    setStep(editing ? 4 : 1)
    setError(null)
    if (editing && detail) {
      setName(detail.agent.name)
      setHandle(detail.agent.description ?? '')
      setPersona(detail.systemPrompt)
    } else if (!editing) {
      setName('')
      setHandle('')
      setPersona('')
    }
  }, [open, editing, detail])

  const busy = create.isPending || update.isPending

  async function submit() {
    setError(null)
    const body = {
      name,
      description: handle || undefined,
      systemPrompt: persona,
      confidenceThreshold: editing ? (detail?.agent.confidenceThreshold ?? 0.7) : 0.7,
    }
    try {
      if (editing) await update.mutateAsync(body)
      else await create.mutateAsync(body)
      onOpenChange(false)
    } catch {
      setError('Could not save the agent. Check the name and persona, then try again.')
    }
  }

  function next() {
    if (step < 4) setStep(step + 1)
    else void submit()
  }

  const nextLabel = step === 4 ? (editing ? 'Save changes' : 'Create agent') : step === 1 ? 'Send code' : step === 2 ? 'Verify' : 'Confirm'
  const canSubmit = step !== 4 || (!!name && !!persona)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[520px]">
        {/* header */}
        <div className="px-6 pt-6">
          <div className="mb-1.5 flex items-center gap-2.5">
            <h2 className="text-[19px] font-extrabold tracking-tight">{editing ? 'Edit agent' : STEP_META[step].title}</h2>
            {!editing && (
              <span className="rounded-[7px] border border-border bg-raised px-2 py-0.5 text-[11.5px] font-bold text-text-3">
                {step} of 4
              </span>
            )}
          </div>
          <p className="text-[13px] text-muted-foreground">{editing ? 'Update this agent’s configuration.' : STEP_META[step].desc}</p>
        </div>

        {/* progress */}
        {!editing && (
          <div className="flex gap-1.5 px-6 pt-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-[3px] flex-1 rounded-full" style={{ background: n <= step ? 'var(--primary)' : 'var(--border)' }} />
            ))}
          </div>
        )}

        {/* body */}
        <div className="max-h-[60vh] space-y-4 overflow-y-auto px-6 py-5">
          {step === 1 && <StepPhone />}
          {step === 2 && <StepCode />}
          {step === 3 && <StepTwoFactor />}
          {step === 4 && (
            <StepConfig
              name={name}
              setName={setName}
              handle={handle}
              setHandle={setHandle}
              model={model}
              setModel={setModel}
              persona={persona}
              setPersona={setPersona}
              ks={ks}
              setKs={setKs}
            />
          )}
          {error && <p className="text-[12.5px] font-semibold text-destructive">{error}</p>}
        </div>

        {/* footer */}
        <div className="flex items-center justify-between gap-2.5 px-6 pb-6 pt-4">
          {step > 1 && !editing ? (
            <Button variant="secondary" className="gap-1.5" onClick={() => setStep(step - 1)}>
              <ArrowLeft size={15} />
              Back
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
          <Button className="gap-2" onClick={next} disabled={busy || !canSubmit}>
            {busy ? 'Saving…' : nextLabel}
            {!busy && <ArrowRight size={15} />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const inputCls = 'w-full rounded-[10px] border border-border bg-raised px-3 py-2.5 text-[13.5px] outline-none focus:border-primary'
const labelCls = 'mb-1.5 block text-[12px] font-bold text-muted-foreground'

// ponytail: Telegram userbot connect (phone/code/2FA) is designed UI only — no backend yet.
function StepPhone() {
  return (
    <div className="space-y-3.5">
      <p className="text-[13.5px] leading-relaxed text-muted-foreground">
        We’ll use your Telegram account as a userbot to monitor and respond to messages. It never posts without your rules.
      </p>
      <div>
        <label className={labelCls}>Phone number</label>
        <div className="flex gap-2">
          <div className="flex min-w-[90px] cursor-pointer items-center gap-2 rounded-[10px] border border-border bg-raised px-3 py-2.5">
            <span className="text-[18px]">🇺🇸</span>
            <span className="text-[13.5px] font-bold">+1</span>
            <ChevronDown size={12} className="text-text-3" />
          </div>
          <input className={cn(inputCls, 'flex-1')} type="tel" placeholder="(555) 000-0000" />
        </div>
      </div>
      <div className="rounded-[11px] border border-border bg-raised p-3 text-[12.5px] leading-relaxed text-text-3">
        Telegram will send a one-time code to this number. Standard message rates may apply.
      </div>
    </div>
  )
}

function StepCode() {
  return (
    <div className="flex flex-col items-center gap-4 py-2 text-center">
      <div className="grid size-14 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
        <Send size={24} />
      </div>
      <div>
        <p className="text-[14px] font-bold">Code sent to your Telegram app</p>
        <p className="text-[13px] text-text-3">Enter the 5-digit code from the notification.</p>
      </div>
      <div className="flex justify-center gap-2.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <input key={i} maxLength={1} className="size-14 rounded-[10px] border border-border bg-raised text-center text-[22px] font-extrabold outline-none focus:border-primary" />
        ))}
      </div>
      <button className="text-[13px] font-semibold text-primary">Didn’t receive it? Resend code</button>
    </div>
  )
}

function StepTwoFactor() {
  return (
    <div className="space-y-3.5">
      <div className="flex flex-col items-center gap-3 py-1 text-center">
        <div className="grid size-14 place-items-center rounded-2xl border border-[#7C83F5]/28 bg-[#7C83F5]/14 text-[#7C83F5]">
          <Shield size={22} />
        </div>
        <div>
          <p className="text-[14px] font-bold">Two-step verification</p>
          <p className="text-[13px] text-text-3">This account has an additional cloud password.</p>
        </div>
      </div>
      <div>
        <label className={labelCls}>Cloud password</label>
        <input className={inputCls} type="password" placeholder="Enter your Telegram cloud password" />
      </div>
    </div>
  )
}

interface ConfigProps {
  name: string
  setName: (v: string) => void
  handle: string
  setHandle: (v: string) => void
  model: Model
  setModel: (v: Model) => void
  persona: string
  setPersona: (v: string) => void
  ks: { products: boolean; faq: boolean; orders: boolean }
  setKs: (v: { products: boolean; faq: boolean; orders: boolean }) => void
}

function StepConfig({ name, setName, handle, setHandle, model, setModel, persona, setPersona, ks, setKs }: ConfigProps) {
  const models: { id: Model; label: string }[] = [
    { id: 'gpt', label: 'GPT-4o' },
    { id: 'claude', label: 'Claude 3.5' },
    { id: 'llama', label: 'Llama 3' },
  ]
  const chips: { id: keyof typeof ks; label: string }[] = [
    { id: 'products', label: 'Products' },
    { id: 'faq', label: 'FAQ & docs' },
    { id: 'orders', label: 'Orders' },
  ]
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Name</label>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nova" />
        </div>
        <div>
          <label className={labelCls}>@handle</label>
          <input className={inputCls} value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@nova_ai" />
        </div>
      </div>
      <div>
        <label className={labelCls}>Model</label>
        <div className="flex gap-0.5 rounded-[11px] border border-border bg-raised p-1">
          {models.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setModel(m.id)}
              className={cn(
                'flex-1 rounded-[8px] py-1.5 text-[12.5px] transition-colors',
                model === m.id ? 'bg-border font-bold text-foreground' : 'font-semibold text-muted-foreground hover:text-foreground',
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className={labelCls}>Persona & instructions</label>
        <textarea
          className={cn(inputCls, 'resize-y font-mono leading-relaxed')}
          rows={3}
          value={persona}
          onChange={(e) => setPersona(e.target.value)}
          placeholder="You are a warm, concise support agent for our store. Always confirm order numbers before…"
        />
      </div>
      <div>
        <label className={labelCls}>Knowledge sources</label>
        <div className="mb-3 flex flex-wrap gap-2">
          {chips.map((c) => {
            const on = ks[c.id]
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setKs({ ...ks, [c.id]: !on })}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors',
                  on ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border bg-raised text-muted-foreground',
                )}
              >
                <Check size={13} />
                {c.label}
              </button>
            )
          })}
        </div>
        <div className="flex cursor-pointer flex-col items-center gap-2 rounded-[11px] border border-dashed border-border bg-raised p-5 text-center">
          <div className="grid size-9 place-items-center rounded-[10px] border border-border bg-card text-muted-foreground">
            <Upload size={18} />
          </div>
          <div className="text-[13px] font-semibold">Click to upload or drag & drop</div>
          <div className="text-[12px] text-text-3">PDF, DOCX, TXT, or CSV · max 10 MB</div>
        </div>
      </div>
    </div>
  )
}
