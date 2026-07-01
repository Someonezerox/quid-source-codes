import { useEffect, useState, type ReactNode } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LogoMark } from '@/components/icons'
import { Avatar } from '@/components/Avatar'
import { ConfidenceBar } from '@/components/Confidence'
import { useApplyTheme } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'

/* ---------- tiny fade-up on scroll ---------- */
function FadeUp({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return (
    <div
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 0.7s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

/* ---------- feature card ---------- */
interface FeatureProps {
  icon: ReactNode
  title: string
  description: string
  tint?: string
}

function FeatureCard({ icon, title, description, tint = 'var(--primary)' }: FeatureProps) {
  return (
    <div className="group relative flex flex-col gap-4 rounded-[20px] border border-border bg-card p-6 transition-all duration-300 hover:border-[rgba(255,255,255,.12)]">
      <div
        className="grid size-11 shrink-0 place-items-center rounded-xl border transition-transform duration-300 group-hover:scale-110"
        style={{
          color: tint,
          background: `color-mix(in srgb, ${tint} 14%, transparent)`,
          borderColor: `color-mix(in srgb, ${tint} 28%, transparent)`,
        }}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-[15px] font-bold">{title}</h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

/* ---------- stat counter ---------- */
function StatCounter({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-[32px] font-extrabold tracking-tight" style={{ color: 'var(--primary)' }}>
        {value}
      </div>
      <div className="mt-1 text-[13px] font-semibold text-muted-foreground">{label}</div>
    </div>
  )
}

/* ============================================================ */
/*  LANDING PAGE                                                  */
/* ============================================================ */
export function LandingPage() {
  useApplyTheme()
  const status = useAuthStore((s) => s.status)

  if (status === 'authed') {
    return <Navigate to="/inbox" replace />
  }

  return (
    <div className="min-h-screen bg-canvas text-foreground">
      {/* ─── NAV ─── */}
      <nav className="sticky top-0 z-50 border-b border-border" style={{ background: 'rgba(var(--background-rgb, 10,10,10), .82)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-[9px] bg-primary text-primary-foreground">
              <LogoMark size={17} />
            </div>
            <span className="text-[15px] font-extrabold tracking-tight">QUID</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground">Features</a>
            <a href="#how-it-works" className="text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground">How it works</a>
            <a href="#stats" className="text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground">Results</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-[13px]">Sign in</Button>
            </Link>
            <Link to="/login">
              <Button className="text-[13px]">Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        {/* background gradient orbs */}
        <div className="pointer-events-none absolute inset-0" style={{
          background: 'radial-gradient(60% 60% at 50% 0%, color-mix(in srgb, var(--primary) 16%, transparent), transparent 70%), radial-gradient(40% 50% at 80% 20%, color-mix(in srgb, #7C83F5 10%, transparent), transparent 60%), radial-gradient(30% 40% at 20% 30%, color-mix(in srgb, #4ADE80 6%, transparent), transparent 50%)',
        }} />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 pb-20 pt-24 text-center lg:px-8 lg:pb-28 lg:pt-32">
          <FadeUp>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5">
              <span className="size-2 rounded-full bg-[#4ADE80] animate-pulse" />
              <span className="text-[12px] font-bold text-muted-foreground">Now serving 500+ businesses across CIS</span>
            </div>
          </FadeUp>

          <FadeUp delay={80}>
            <h1 className="max-w-3xl text-[clamp(32px,5.5vw,56px)] font-extrabold leading-[1.08] tracking-tight">
              AI-first customer support for{' '}
              <span style={{ color: 'var(--primary)' }}>Telegram</span>
            </h1>
          </FadeUp>

          <FadeUp delay={160}>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-muted-foreground lg:text-[17px]">
              QUID routes conversations between your AI agents and human team using a live confidence score — so customers get instant answers, and your staff steps in only when it matters.
            </p>
          </FadeUp>

          <FadeUp delay={240}>
            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row">
              <Link to="/login">
                <Button className="h-12 px-7 text-[15px]">Start free trial</Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="secondary" className="h-12 px-7 text-[15px]">See how it works</Button>
              </a>
            </div>
          </FadeUp>

          {/* ─── PRODUCT PREVIEW ─── */}
          <FadeUp delay={360} className="mt-16 w-full max-w-2xl">
            <div className="rounded-[20px] border border-border bg-card p-1.5">
              <div className="rounded-[16px] border border-border bg-canvas p-5 lg:p-6">
                {/* header bar */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name="Dildora Azimova" size={36} />
                    <div>
                      <div className="text-[13.5px] font-bold">Dildora Azimova</div>
                      <div className="text-[11.5px] text-text-3">@dildora_a · Telegram</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[.04em]" style={{ color: 'var(--primary)', background: 'color-mix(in srgb, var(--primary) 14%, transparent)', borderColor: 'color-mix(in srgb, var(--primary) 28%, transparent)' }}>
                      AI handling
                    </span>
                  </div>
                </div>

                {/* messages */}
                <div className="space-y-3">
                  <div className="max-w-[82%] rounded-[16px_16px_16px_4px] border border-border bg-raised px-4 py-2.5 text-[13.5px] leading-snug">
                    Hi! I booked for 3pm today — is my appointment confirmed?
                  </div>
                  <div className="ml-auto max-w-[82%] rounded-[16px_4px_16px_16px] border px-4 py-2.5 text-[13.5px] leading-snug" style={{ borderColor: 'color-mix(in srgb, var(--primary) 20%, transparent)', background: 'color-mix(in srgb, var(--primary) 6%, transparent)' }}>
                    Yes! Your appointment at 3:00 PM today is confirmed. We look forward to seeing you, Dildora! 😊
                  </div>
                  <ConfidenceBar score={0.96} className="justify-end" />
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section id="stats" className="border-y border-border">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-6 py-14 lg:grid-cols-4 lg:px-8">
          <FadeUp delay={0}><StatCounter value="94%" label="AI resolution rate" /></FadeUp>
          <FadeUp delay={80}><StatCounter value="< 2s" label="Average response" /></FadeUp>
          <FadeUp delay={160}><StatCounter value="500+" label="Businesses served" /></FadeUp>
          <FadeUp delay={240}><StatCounter value="12M+" label="Messages handled" /></FadeUp>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20 lg:px-8 lg:py-28">
        <FadeUp>
          <div className="text-center">
            <h2 className="text-[28px] font-extrabold tracking-tight lg:text-[34px]">Everything you need in one inbox</h2>
            <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
              From AI routing to knowledge bases — QUID gives your team superpowers without replacing them.
            </p>
          </div>
        </FadeUp>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FadeUp delay={0}>
            <FeatureCard
              icon={<BrainIcon />}
              title="Confidence-score routing"
              description="Every AI reply comes with a live confidence score. Below your threshold? The conversation is instantly escalated to a human agent."
            />
          </FadeUp>
          <FadeUp delay={80}>
            <FeatureCard
              icon={<InboxStackIcon />}
              title="Unified omni-channel inbox"
              description="Telegram today, more channels tomorrow. All conversations funnel into one beautiful inbox your team already knows how to use."
              tint="#38BDF8"
            />
          </FadeUp>
          <FadeUp delay={160}>
            <FeatureCard
              icon={<BookOpenIcon />}
              title="RAG knowledge bases"
              description="Upload your FAQs, product sheets, or policies. The AI agent retrieves the right context for every answer — no hallucinations."
              tint="#A78BFA"
            />
          </FadeUp>
          <FadeUp delay={240}>
            <FeatureCard
              icon={<HandIcon />}
              title="One-click takeover"
              description='When it matters, your staff clicks "Take over" and jumps into the chat — the customer never notices the handoff.'
              tint="#FBBF24"
            />
          </FadeUp>
          <FadeUp delay={320}>
            <FeatureCard
              icon={<MemoryIcon />}
              title="Customer memory"
              description="QUID remembers past conversations, preferences, and context — so returning customers feel recognized, not interrogated."
              tint="#34D399"
            />
          </FadeUp>
          <FadeUp delay={400}>
            <FeatureCard
              icon={<ChartIcon />}
              title="Real-time analytics"
              description="Track resolution rates, response times, agent performance, and AI confidence — all in a live dashboard built for operators."
              tint="#F472B6"
            />
          </FadeUp>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="border-y border-border bg-card">
        <div className="mx-auto max-w-5xl px-6 py-20 lg:px-8 lg:py-28">
          <FadeUp>
            <div className="text-center">
              <h2 className="text-[28px] font-extrabold tracking-tight lg:text-[34px]">Up and running in minutes</h2>
              <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                Three steps to transform your Telegram support.
              </p>
            </div>
          </FadeUp>

          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {[
              { step: '01', title: 'Connect your bot', description: 'Paste your Telegram bot token. QUID registers the webhook and starts listening instantly.' },
              { step: '02', title: 'Train your AI agent', description: 'Set a system prompt, upload knowledge-base docs, and pick your confidence threshold.' },
              { step: '03', title: 'Go live', description: 'Activate the channel. AI handles the easy questions; your team gets only the hard ones.' },
            ].map((item, i) => (
              <FadeUp key={item.step} delay={i * 100}>
                <div className="relative flex flex-col gap-3 rounded-[20px] border border-border bg-canvas p-6">
                  <span className="text-[42px] font-extrabold leading-none tracking-tight" style={{ color: 'var(--primary)', opacity: 0.25 }}>
                    {item.step}
                  </span>
                  <h3 className="text-[16px] font-bold">{item.title}</h3>
                  <p className="text-[13.5px] leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0" style={{
          background: 'radial-gradient(50% 80% at 50% 100%, color-mix(in srgb, var(--primary) 12%, transparent), transparent 70%)',
        }} />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center lg:py-32">
          <FadeUp>
            <h2 className="text-[28px] font-extrabold tracking-tight lg:text-[38px]">
              Ready to transform your Telegram support?
            </h2>
          </FadeUp>
          <FadeUp delay={80}>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Join 500+ businesses across the CIS region that trust QUID to handle millions of customer conversations.
            </p>
          </FadeUp>
          <FadeUp delay={160}>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
              <Link to="/login">
                <Button className="h-12 px-8 text-[15px]">Get started — it&apos;s free</Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" className="h-12 px-8 text-[15px]">Sign in</Button>
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-[12.5px] text-muted-foreground lg:flex-row lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="grid size-6 place-items-center rounded-[7px] bg-primary text-primary-foreground">
              <LogoMark size={12} />
            </div>
            <span className="font-bold text-foreground">QUID</span>
            <span className="text-text-3">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6 font-semibold">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">How it works</a>
            <Link to="/login" className="transition-colors hover:text-foreground">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ────────── inline SVG icons for feature cards ────────── */
function BrainIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a4 4 0 0 0-4 4v1a4 4 0 0 0-4 4 4 4 0 0 0 2.5 3.7V18a4 4 0 0 0 4 4h3a4 4 0 0 0 4-4v-3.3A4 4 0 0 0 20 11a4 4 0 0 0-4-4V6a4 4 0 0 0-4-4Z" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function InboxStackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="3" />
      <path d="M2 12h5l2 3h6l2-3h5" />
    </svg>
  )
}

function BookOpenIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2Z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7Z" />
    </svg>
  )
}

function HandIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 11V6a2 2 0 0 0-4 0v1" />
      <path d="M14 10V4a2 2 0 0 0-4 0v2" />
      <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
  )
}

function MemoryIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="21.17" y1="8" x2="12" y2="8" />
      <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
      <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 16l4-8 4 4 6-10" />
    </svg>
  )
}
