import { lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/router/ProtectedRoute'
import { RoleGuard } from '@/router/RoleGuard'
import { Placeholder } from '@/pages/Placeholder'
import { Styleguide } from '@/pages/Styleguide'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { useAuthBootstrap } from '@/features/auth/session'
import { useApplyTheme } from '@/store/uiStore'

const AgentsPage = lazy(() => import('@/features/agents/AgentsPage'))

function App() {
  useApplyTheme()
  useAuthBootstrap()
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Placeholder title="Dashboard" milestone="F4" />} />
            <Route path="/inbox" element={<Placeholder title="Inbox" milestone="F5" />} />
            <Route path="/products" element={<Placeholder title="Products" milestone="F9" />} />
            <Route path="/contacts" element={<Placeholder title="Contacts" milestone="F10" />} />
            <Route path="/styleguide" element={<Styleguide />} />

            {/* ADMIN-only */}
            <Route element={<RoleGuard allow={['ADMIN']} />}>
              <Route path="/agents" element={<AgentsPage />} />
              <Route path="/integrations" element={<Placeholder title="Integrations" milestone="F11" />} />
              <Route path="/settings" element={<Placeholder title="Settings" milestone="F12" />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
