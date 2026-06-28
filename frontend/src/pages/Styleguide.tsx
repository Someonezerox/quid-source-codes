import { Bot, Clock, MessageSquare, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar } from '@/components/Avatar'
import { StatusDot, StatusPill } from '@/components/StatusBadge'
import { ConfidencePill, ConfidenceBar } from '@/components/Confidence'
import { StatCard } from '@/components/StatCard'
import { SegmentedControl } from '@/components/SegmentedControl'
import { useUiStore } from '@/store/uiStore'
import { ACCENTS } from '@/lib/tokens'
import { compact } from '@/lib/format'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.05em] text-text-3">{title}</h2>
      <div className="flex flex-wrap items-center gap-4">{children}</div>
    </section>
  )
}

export function Styleguide() {
  const { theme, setTheme, accent, setAccent } = useUiStore()

  return (
    <div className="min-h-screen bg-canvas p-10 text-foreground">
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-[10px] bg-primary font-extrabold text-primary-foreground">Q</div>
            <span className="text-xl font-extrabold tracking-tight">QUID Styleguide</span>
          </div>
          <div className="flex items-center gap-3">
            <SegmentedControl
              value={theme}
              onChange={setTheme}
              segments={[
                { value: 'dark', label: 'Dark' },
                { value: 'light', label: 'Light' },
              ]}
            />
            <div className="flex gap-1.5">
              {ACCENTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAccent(c)}
                  aria-label={`accent ${c}`}
                  className="size-6 rounded-full border-2"
                  style={{ background: c, borderColor: c === accent ? 'var(--foreground)' : 'transparent' }}
                />
              ))}
            </div>
          </div>
        </header>

        <Section title="Stat cards">
          <StatCard label="Open conversations" value="142" icon={<MessageSquare size={19} />} />
          <StatCard label="Messages handled" value={compact(48211)} icon={<Users size={19} />} tint="#7C83F5" />
          <StatCard label="AI resolution rate" value="86%" icon={<Bot size={19} />} tint="#4ADE80" />
          <StatCard label="Avg response" value="1.2s" icon={<Clock size={19} />} tint="#FBBF24" />
        </Section>

        <Section title="Avatars">
          <Avatar name="Maria Kovács" />
          <Avatar name="Daniel Roth" />
          <Avatar name="Priya Nair" size={48} />
          <Avatar name="Ahmed Hassan" size={32} />
        </Section>

        <Section title="Status">
          <StatusDot status="AI_HANDLING" />
          <StatusDot status="NEEDS_HUMAN" />
          <StatusDot status="RESOLVED" />
          <StatusPill status="AI_HANDLING" />
          <StatusPill status="NEEDS_HUMAN" />
          <StatusPill status="RESOLVED" />
        </Section>

        <Section title="Confidence">
          <ConfidencePill score={0.96} />
          <ConfidencePill score={0.52} />
          <ConfidenceBar score={0.88} />
        </Section>

        <Section title="Buttons & badges">
          <Button>Primary action</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Delete</Button>
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
        </Section>

        <Section title="Skeletons">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-10 w-64" />
        </Section>
      </div>
    </div>
  )
}
