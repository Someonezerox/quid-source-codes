import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, FileText, Send, Shield, Trash2, Upload } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { cn } from '@/lib/utils'
import {
  assignAgentToChannel,
  createKnowledgeBase,
  sendUserbotCode,
  setUserbotGroup,
  uploadKnowledgeDoc,
  userbotSignIn,
} from '@/api/agentsApi'
import { useAgent, useCreateAgent, useDeleteEntry, useEntries, useUpdateAgent, useUserbotGroups } from './hooks'
import type { UserbotGroup } from '@/api/agentsApi'

type Model = 'gpt' | 'claude' | 'llama'

// Picker option → OpenRouter model id (what the backend stores / calls).
const MODEL_IDS: Record<Model, string> = {
  gpt: 'openai/gpt-4o',
  claude: 'anthropic/claude-3.5-sonnet',
  llama: 'meta-llama/llama-3.1-70b-instruct',
}

function modelToLocal(id: string | null): Model {
  const match = (Object.keys(MODEL_IDS) as Model[]).find((k) => MODEL_IDS[k] === id)
  return match ?? 'gpt'
}

// Dial codes for the phone step — primary market first.
const DIAL_CODES = [
  { code: '+998', flag: '🇺🇿' },
  { code: '+7', flag: '🇷🇺' },
  { code: '+1', flag: '🇺🇸' },
  { code: '+90', flag: '🇹🇷' },
]

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
  const qc = useQueryClient()
  const { data: detail } = useAgent(agentId ?? 0, editing && open)
  const create = useCreateAgent()
  const update = useUpdateAgent(agentId ?? 0)

  const [step, setStep] = useState(editing ? 4 : 1)
  const [name, setName] = useState('')
  const [handle, setHandle] = useState('')
  const [model, setModel] = useState<Model>('gpt')
  const [persona, setPersona] = useState('')
  const [channelId, setChannelId] = useState<number | null>(null)
  const [groupId, setGroupId] = useState<number | null>(null)
  const [kbId, setKbId] = useState<number | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  // groups are listable once the userbot channel (with a live session) exists
  const groupsQuery = useUserbotGroups(channelId, open && step === 4)

  // Telegram connect state
  const [dialCode, setDialCode] = useState('+998')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [phoneCodeHash, setPhoneCodeHash] = useState('')
  const [connecting, setConnecting] = useState(false)

  // (re)seed when opening, and prefill in edit mode once the detail loads
  useEffect(() => {
    if (!open) return
    setStep(editing ? 4 : 1)
    setError(null)
    setPhone('')
    setCode('')
    setPassword('')
    setPhoneCodeHash('')
    if (editing && detail) {
      setName(detail.agent.name)
      setHandle(detail.agent.description ?? '')
      setPersona(detail.systemPrompt)
      setModel(modelToLocal(detail.agent.model))
      setChannelId(detail.assignedChannels[0]?.id ?? null)
      setGroupId(detail.assignedChannels[0]?.allowedChatId ?? null)
      setKbId(detail.knowledgeBases[0]?.id)
    } else if (!editing) {
      setName('')
      setHandle('')
      setPersona('')
      setChannelId(null)
      setGroupId(null)
      setKbId(undefined)
    }
  }, [open, editing, detail])

  const busy = create.isPending || update.isPending

  const fullPhone = () => dialCode + phone.replace(/\D/g, '')

  async function sendCode() {
    setError(null)
    setConnecting(true)
    try {
      const { phoneCodeHash } = await sendUserbotCode(fullPhone())
      setPhoneCodeHash(phoneCodeHash)
      setStep(2)
    } catch (e) {
      const status = axios.isAxiosError(e) ? e.response?.status : undefined
      setError(
        status === 400
          ? 'That number isn’t valid for Telegram. Pick the right country and enter the national number only (no country code).'
          : 'Could not reach Telegram. Make sure the userbot service is running, then try again.',
      )
    } finally {
      setConnecting(false)
    }
  }

  /** Completes auth on step 2 (no password) or step 3 (with password). 409 → 2FA needed. */
  async function signIn(withPassword: boolean) {
    setError(null)
    setConnecting(true)
    try {
      const channel = await userbotSignIn({
        phone: fullPhone(),
        code,
        phoneCodeHash,
        password: withPassword ? password : undefined,
        channelName: name || undefined,
      })
      await qc.invalidateQueries({ queryKey: ['channels'] })
      setChannelId(channel.id)
      setStep(4)
    } catch (e) {
      const status = axios.isAxiosError(e) ? e.response?.status : undefined
      if (status === 409 && !withPassword) {
        setStep(3) // account has 2FA — collect the cloud password
      } else if (status === 400) {
        setError('That code is invalid or expired. Resend and try again.')
      } else if (withPassword) {
        setError('Incorrect cloud password.')
      } else {
        setError('Sign-in failed. Please try again.')
      }
    } finally {
      setConnecting(false)
    }
  }

  async function submit() {
    setError(null)
    const body = {
      name,
      description: handle || undefined,
      systemPrompt: persona,
      model: MODEL_IDS[model],
      confidenceThreshold: editing ? (detail?.agent.confidenceThreshold ?? 0.7) : 0.7,
    }
    try {
      const saved = editing ? await update.mutateAsync(body) : await create.mutateAsync(body)
      if (channelId != null) {
        await assignAgentToChannel(saved.id, channelId)
        await setUserbotGroup(channelId, groupId)
      }
      onOpenChange(false)
    } catch {
      setError('Could not save the agent. Check the name and persona, then try again.')
    }
  }

  function next() {
    if (step === 1) void sendCode()
    else if (step === 2) void signIn(false)
    else if (step === 3) void signIn(true)
    else void submit()
  }

  const nextLabel =
    step === 4
      ? editing
        ? 'Save changes'
        : 'Create agent'
      : step === 1
        ? 'Send code'
        : step === 2
          ? 'Verify'
          : 'Confirm'

  const canSubmit =
    step === 1
      ? phone.replace(/\D/g, '').length >= 6
      : step === 2
        ? code.length === 5
        : step === 3
          ? password.length > 0
          : !!name && !!persona

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
          {step === 1 && (
            <StepPhone dialCode={dialCode} setDialCode={setDialCode} phone={phone} setPhone={setPhone} />
          )}
          {step === 2 && <StepCode code={code} setCode={setCode} onResend={() => void sendCode()} resending={connecting} />}
          {step === 3 && <StepTwoFactor password={password} setPassword={setPassword} />}
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
              hasChannel={channelId != null}
              groups={groupsQuery.data ?? []}
              groupsLoading={groupsQuery.isLoading}
              groupsError={groupsQuery.isError}
              groupId={groupId}
              setGroupId={setGroupId}
              agentId={agentId}
              kbId={kbId}
              setKbId={setKbId}
            />
          )}
          {error && <p className="text-[12.5px] font-semibold text-destructive">{error}</p>}
        </div>

        {/* footer */}
        <div className="flex items-center justify-between gap-2.5 px-6 pb-6 pt-4">
          {step > 1 && !editing ? (
            <Button variant="secondary" className="gap-1.5" onClick={() => setStep(step - 1)} disabled={connecting}>
              <ArrowLeft size={15} />
              Back
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
          <Button className="gap-2" onClick={next} disabled={busy || connecting || !canSubmit}>
            {busy || connecting ? 'Working…' : nextLabel}
            {!busy && !connecting && <ArrowRight size={15} />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const inputCls = 'w-full rounded-[10px] border border-border bg-raised px-3 py-2.5 text-[13.5px] outline-none focus:border-primary'
const labelCls = 'mb-1.5 block text-[12px] font-bold text-muted-foreground'

function StepPhone({
  dialCode,
  setDialCode,
  phone,
  setPhone,
}: {
  dialCode: string
  setDialCode: (v: string) => void
  phone: string
  setPhone: (v: string) => void
}) {
  const flag = DIAL_CODES.find((d) => d.code === dialCode)?.flag ?? '🌐'
  return (
    <div className="space-y-3.5">
      <p className="text-[13.5px] leading-relaxed text-muted-foreground">
        We’ll use your Telegram account as a userbot to monitor and respond to messages. It never posts without your rules.
      </p>
      <div>
        <label className={labelCls}>Phone number</label>
        <div className="flex gap-2">
          <div className="relative flex min-w-[96px] items-center gap-2 rounded-[10px] border border-border bg-raised px-3 py-2.5">
            <span className="text-[18px]">{flag}</span>
            <span className="text-[13.5px] font-bold">{dialCode}</span>
            <select
              value={dialCode}
              onChange={(e) => setDialCode(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Country dial code"
            >
              {DIAL_CODES.map((d) => (
                <option key={d.code + d.flag} value={d.code}>
                  {d.flag} {d.code}
                </option>
              ))}
            </select>
          </div>
          <input
            className={cn(inputCls, 'flex-1')}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="90 123 45 67"
          />
        </div>
      </div>
      <div className="rounded-[11px] border border-border bg-raised p-3 text-[12.5px] leading-relaxed text-text-3">
        Telegram will send a one-time code to this number. Standard message rates may apply.
      </div>
    </div>
  )
}

function StepCode({
  code,
  setCode,
  onResend,
  resending,
}: {
  code: string
  setCode: (v: string) => void
  onResend: () => void
  resending: boolean
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([])

  function setDigit(i: number, char: string) {
    const d = char.replace(/\D/g, '').slice(-1)
    const next = (code.slice(0, i) + d + code.slice(i + 1)).slice(0, 5)
    setCode(next)
    if (d && i < 4) refs.current[i + 1]?.focus()
  }

  function onKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !code[i] && i > 0) refs.current[i - 1]?.focus()
  }

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
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el
            }}
            inputMode="numeric"
            maxLength={1}
            value={code[i] ?? ''}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKey(i, e)}
            className="size-14 rounded-[10px] border border-border bg-raised text-center text-[22px] font-extrabold outline-none focus:border-primary"
          />
        ))}
      </div>
      <button className="text-[13px] font-semibold text-primary disabled:opacity-50" onClick={onResend} disabled={resending}>
        Didn’t receive it? Resend code
      </button>
    </div>
  )
}

function StepTwoFactor({ password, setPassword }: { password: string; setPassword: (v: string) => void }) {
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
        <input
          className={inputCls}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your Telegram cloud password"
        />
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
  hasChannel: boolean
  groups: UserbotGroup[]
  groupsLoading: boolean
  groupsError: boolean
  groupId: number | null
  setGroupId: (v: number | null) => void
  agentId?: number
  kbId?: number
  setKbId: (id: number) => void
}

function StepConfig({ name, setName, handle, setHandle, model, setModel, persona, setPersona, hasChannel, groups, groupsLoading, groupsError, groupId, setGroupId, agentId, kbId, setKbId }: ConfigProps) {
  const models: { id: Model; label: string }[] = [
    { id: 'gpt', label: 'GPT-4o' },
    { id: 'claude', label: 'Claude 3.5' },
    { id: 'llama', label: 'Llama 3' },
  ]
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Name</label>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nova" />
        </div>
        <div>
          <label className={labelCls}>Description</label>
          <input className={inputCls} value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="Short label, e.g. Store support" />
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
        <KnowledgeFiles kbId={kbId} />
        <UploadDropzone agentId={agentId} kbId={kbId} setKbId={setKbId} />
      </div>
      <div>
        <label className={labelCls}>Respond in group</label>
        <select
          className={cn(inputCls, 'cursor-pointer')}
          value={groupId ?? ''}
          onChange={(e) => setGroupId(e.target.value ? Number(e.target.value) : null)}
          disabled={!hasChannel || groupsLoading}
        >
          <option value="">Direct messages only</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.title}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-[11.5px] text-text-3">
          {!hasChannel
            ? 'Connect Telegram first to pick a group.'
            : groupsLoading
              ? 'Loading your groups…'
              : groupsError
                ? 'Couldn’t load groups — make sure the userbot session is live.'
                : 'The bot always answers DMs, plus the group you pick here.'}
        </p>
      </div>
    </div>
  )
}

/** One card per uploaded document (entries are chunked, so we group by source filename). */
function KnowledgeFiles({ kbId }: { kbId?: number }) {
  const { data: entries } = useEntries(kbId)
  const del = useDeleteEntry(kbId ?? 0)
  const [pending, setPending] = useState<{ name: string; ids: number[] } | null>(null)

  const files = useMemo(() => {
    const map = new Map<string, number[]>()
    for (const e of entries ?? []) {
      const name = e.title.split(' — part ')[0]
      map.set(name, [...(map.get(name) ?? []), e.id])
    }
    return [...map.entries()].map(([name, ids]) => ({ name, ids }))
  }, [entries])

  if (files.length === 0) return null

  async function remove() {
    if (!pending) return
    await Promise.all(pending.ids.map((id) => del.mutateAsync(id)))
    setPending(null)
  }

  return (
    <div className="mb-3 space-y-2">
      {files.map((f) => (
        <div key={f.name} className="flex items-center gap-3 rounded-[10px] border border-border bg-raised px-3 py-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-[8px] border border-border bg-card text-primary">
            <FileText size={15} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-bold">{f.name}</div>
            <div className="text-[11.5px] text-text-3">{f.ids.length} chunk{f.ids.length === 1 ? '' : 's'} indexed</div>
          </div>
          <button
            type="button"
            onClick={() => setPending(f)}
            title="Remove file"
            aria-label={`Remove ${f.name}`}
            className="grid size-7 shrink-0 place-items-center rounded-[7px] text-text-3 transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <ConfirmDialog
        open={pending != null}
        onOpenChange={(o) => !o && setPending(null)}
        title={`Remove “${pending?.name ?? ''}”?`}
        description="The document and all of its indexed chunks will be deleted from this agent’s knowledge base."
        confirmLabel="Remove file"
        destructive
        loading={del.isPending}
        onConfirm={remove}
      />
    </div>
  )
}

type UploadState = { status: 'idle' | 'busy' | 'done' | 'error'; message?: string }

/** Functional knowledge upload: ensures a KB exists for the agent, then posts the file. */
function UploadDropzone({ agentId, kbId, setKbId }: { agentId?: number; kbId?: number; setKbId: (id: number) => void }) {
  const qc = useQueryClient()
  const [state, setState] = useState<UploadState>({ status: 'idle' })
  const inputRef = useRef<HTMLInputElement>(null)

  // upload is only possible once the agent (and thus a KB) exists
  if (agentId == null) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-[11px] border border-dashed border-border bg-raised p-5 text-center opacity-70">
        <div className="grid size-9 place-items-center rounded-[10px] border border-border bg-card text-muted-foreground">
          <Upload size={18} />
        </div>
        <div className="text-[13px] font-semibold">Upload available after creating the agent</div>
        <div className="text-[12px] text-text-3">Create the agent, then reopen it to add documents.</div>
      </div>
    )
  }

  async function onFile(file: File) {
    setState({ status: 'busy', message: `Uploading ${file.name}…` })
    try {
      let id = kbId
      if (id == null) {
        id = (await createKnowledgeBase(agentId as number, 'Knowledge Base')).id
        setKbId(id)
      }
      const entries = await uploadKnowledgeDoc(id, file)
      await qc.invalidateQueries({ queryKey: ['kb', id, 'entries'] })
      setState({ status: 'done', message: `Added ${entries.length} chunk${entries.length === 1 ? '' : 's'} from ${file.name}` })
    } catch {
      setState({ status: 'error', message: 'Upload failed. Supported: PDF, TXT, CSV, MD (max 10 MB).' })
    }
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="flex cursor-pointer flex-col items-center gap-2 rounded-[11px] border border-dashed border-border bg-raised p-5 text-center hover:border-primary"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,.csv,.md"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) void onFile(f)
          e.target.value = ''
        }}
      />
      <div className="grid size-9 place-items-center rounded-[10px] border border-border bg-card text-muted-foreground">
        <Upload size={18} />
      </div>
      {state.status === 'idle' && <div className="text-[13px] font-semibold">Click to upload or drag & drop</div>}
      {state.status !== 'idle' && (
        <div className={cn('text-[13px] font-semibold', state.status === 'error' ? 'text-destructive' : state.status === 'done' ? 'text-status-resolved' : 'text-foreground')}>
          {state.message}
        </div>
      )}
      <div className="text-[12px] text-text-3">PDF, TXT, CSV, or MD · max 10 MB</div>
    </div>
  )
}
