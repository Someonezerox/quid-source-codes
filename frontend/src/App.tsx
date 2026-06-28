import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/router/ProtectedRoute'
import { RoleGuard } from '@/router/RoleGuard'
import { Placeholder } from '@/pages/Placeholder'
import { Styleguide } from '@/pages/Styleguide'
import { LoginStub } from '@/pages/LoginStub'
import { useApplyTheme } from '@/store/uiStore'

function App() {
  useApplyTheme()
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginStub />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/inbox" replace />} />
            <Route path="/dashboard" element={<Placeholder title="Dashboard" milestone="F4" />} />
            <Route path="/inbox" element={<Placeholder title="Inbox" milestone="F5" />} />
            <Route path="/products" element={<Placeholder title="Products" milestone="F9" />} />
            <Route path="/contacts" element={<Placeholder title="Contacts" milestone="F10" />} />
            <Route path="/styleguide" element={<Styleguide />} />

            {/* ADMIN-only */}
            <Route element={<RoleGuard allow={['ADMIN']} />}>
              <Route path="/agents" element={<Placeholder title="Agents" milestone="F8" />} />
              <Route path="/integrations" element={<Placeholder title="Integrations" milestone="F11" />} />
              <Route path="/settings" element={<Placeholder title="Settings" milestone="F12" />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/inbox" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
