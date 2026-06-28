import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'

// ponytail: dev-only stand-in for the real login (F3 builds email/password + Google OAuth).
export function LoginStub() {
  const setUser = useAuthStore((s) => s.setUser)
  const navigate = useNavigate()

  const signIn = () => {
    setUser({
      accessToken: 'dev',
      userId: 'dev-user',
      userName: 'My Workspace',
      role: 'ADMIN',
      workspaceId: 'dev-ws',
      workspaceName: 'My Workspace',
    })
    navigate('/inbox', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-8 text-foreground">
      <div className="w-full max-w-sm space-y-5 rounded-xl border border-border bg-card p-8 text-center">
        <div className="flex items-center justify-center gap-3">
          <div className="grid size-9 place-items-center rounded-[10px] bg-primary font-extrabold text-primary-foreground">Q</div>
          <span className="text-lg font-extrabold tracking-tight">QUID</span>
        </div>
        <p className="text-sm text-muted-foreground">Real auth arrives in F3. For now, sign in as a dev admin.</p>
        <Button className="w-full" onClick={signIn}>
          Sign in (dev)
        </Button>
      </div>
    </div>
  )
}
