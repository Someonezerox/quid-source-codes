import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

/** Persistent shell: sidebar + scrollable outlet. Renders once; routes swap the outlet only. */
export function AppShell() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-canvas text-foreground">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
