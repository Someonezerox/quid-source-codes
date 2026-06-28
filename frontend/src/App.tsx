import { Button } from '@/components/ui/button'

// ponytail: temporary token/shadcn smoke screen. Replaced by the real shell + router in F2.
function App() {
  return (
    <div className="min-h-screen bg-canvas text-foreground flex items-center justify-center p-8">
      <div className="bg-card border border-border rounded-xl p-8 w-full max-w-md space-y-5">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-[10px] grid place-items-center bg-primary text-primary-foreground font-extrabold">
            Q
          </div>
          <span className="text-lg font-extrabold tracking-tight">QUID</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Design tokens wired to shadcn — dark canvas, lime primary, Manrope.
        </p>
        <div className="flex items-center gap-2">
          <span className="text-status-ai text-xs font-bold">AI handling</span>
          <span className="text-status-human text-xs font-bold">Needs human</span>
          <span className="text-status-resolved text-xs font-bold">Resolved</span>
        </div>
        <Button>Primary action</Button>
      </div>
    </div>
  )
}

export default App
