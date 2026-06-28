import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Styleguide } from '@/pages/Styleguide'
import { useApplyTheme } from '@/store/uiStore'

function App() {
  useApplyTheme()
  return (
    <BrowserRouter>
      <Routes>
        {/* ponytail: only the styleguide route exists in F1. F2 adds AppShell + the real routes. */}
        <Route path="/styleguide" element={<Styleguide />} />
        <Route path="*" element={<Navigate to="/styleguide" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
