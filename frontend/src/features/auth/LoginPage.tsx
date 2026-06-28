import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LogoMark } from '@/components/icons'
import { Avatar } from '@/components/Avatar'
import { ConfidenceBar } from '@/components/Confidence'
import { signIn, signUp } from './session'

type Mode = 'signin' | 'signup'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/inbox'

  const [mode, setMode] = useState<Mode>('signin')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (mode === 'signin') await signIn(email, password)
      else await signUp(email, password, fullName)
      navigate(from, { replace: true })
    } catch {
      setError(mode === 'signin' ? 'Invalid email or password.' : 'Could not create account. Try another email.')
    } finally {
      setBusy(false)
    }
  }

  const inputClass =
    'w-full rounded-[11px] border border-border bg-raised px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary'

  return (
    <div className="flex min-h-screen bg-canvas text-foreground">
      {/* ---------------- Left: form ---------------- */}
      <div className="flex w-full flex-col px-6 py-8 lg:w-[46%] lg:px-16">
        <div className="flex items-center gap-2.5">
          <div className="grid size-8 place-items-center rounded-[9px] bg-primary text-primary-foreground">
            <LogoMark size={17} />
          </div>
          <span className="text-[15px] font-extrabold tracking-tight">QUID</span>
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          <h1 className="text-[26px] font-extrabold tracking-tight">
            {mode === 'signin' ? 'Welcome back' : 'Create your workspace'}
          </h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">
            {mode === 'signin'
              ? 'Sign in to your QUID inbox.'
              : 'Start handling Telegram conversations with AI.'}
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-3">
            {mode === 'signup' && (
              <input
                required
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
              />
            )}
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
            <input
              type="password"
              required
              minLength={mode === 'signup' ? 8 : undefined}
              placeholder={mode === 'signup' ? 'Password (min 8 characters)' : 'Password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            {error && <p className="text-[12.5px] font-semibold text-destructive">{error}</p>}
            <Button type="submit" className="h-11 w-full text-[14px]" disabled={busy}>
              {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-text-3">
            <div className="h-px flex-1 bg-border" />
            or
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Google OAuth round-trip handled by backend M12; lands on /auth/callback. */}
          <Button
            variant="secondary"
            className="h-11 w-full gap-2.5 text-[14px]"
            onClick={() => (window.location.href = '/api/auth/google')}
          >
            <GoogleGlyph />
            {mode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
          </Button>

          <p className="mt-7 text-center text-[13px] text-muted-foreground">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin')
                setError(null)
              }}
              className="font-bold text-primary hover:underline"
            >
              {mode === 'signin' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>

      {/* ---------------- Right: brand panel ---------------- */}
      <div className="relative hidden overflow-hidden border-l border-border lg:flex lg:w-[54%]">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 120% at 100% 0%, color-mix(in srgb, var(--primary) 22%, transparent), transparent 55%), radial-gradient(100% 100% at 0% 100%, color-mix(in srgb, #7C83F5 18%, transparent), transparent 50%), var(--card)',
          }}
        />
        <div className="relative z-10 flex w-full flex-col justify-center gap-10 px-16">
          <div className="max-w-md">
            <h2 className="text-[34px] font-extrabold leading-[1.1] tracking-tight">
              Turn every Telegram chat into a resolved conversation.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              QUID routes between AI and your team with a live confidence score — so customers get
              answers instantly, and your agents step in only when it matters.
            </p>
          </div>

          {/* product preview — a mock thread built from the design system */}
          <div className="w-full max-w-md space-y-3 rounded-2xl border border-border bg-canvas/70 p-5 backdrop-blur">
            <div className="flex items-center gap-3">
              <Avatar name="Maria Kovács" size={36} />
              <div>
                <div className="text-[13.5px] font-bold">Maria Kovács</div>
                <div className="text-[11.5px] text-text-3">@maria_k · Telegram</div>
              </div>
            </div>
            <div className="ml-auto max-w-[80%] rounded-[16px_4px_16px_16px] border border-primary/20 bg-primary/[0.06] px-4 py-2.5 text-[13.5px] leading-snug">
              Your order #7782 shipped this morning — arriving Friday. Want the tracking link?
            </div>
            <ConfidenceBar score={0.94} className="justify-end" />
          </div>
        </div>
      </div>
    </div>
  )
}

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  )
}
