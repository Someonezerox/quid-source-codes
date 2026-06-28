import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LogoMark } from '@/components/icons'
import { signIn } from './session'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/inbox'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await signIn(email, password)
      navigate(from, { replace: true })
    } catch {
      setError('Invalid email or password.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-8 text-foreground">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-border bg-card p-8">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-[10px] bg-primary text-primary-foreground">
            <LogoMark />
          </div>
          <span className="text-lg font-extrabold tracking-tight">QUID</span>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-[11px] border border-border bg-raised px-3.5 py-2.5 text-sm outline-none focus:border-primary"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-[11px] border border-border bg-raised px-3.5 py-2.5 text-sm outline-none focus:border-primary"
          />
          {error && <p className="text-[12.5px] font-semibold text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-text-3">
          <div className="h-px flex-1 bg-border" />
          or
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Google OAuth round-trip handled by backend M12; lands on /auth/callback. */}
        <Button variant="secondary" className="w-full" onClick={() => (window.location.href = '/api/auth/google')}>
          Continue with Google
        </Button>
      </div>
    </div>
  )
}
