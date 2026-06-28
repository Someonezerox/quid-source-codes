import { useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ACCENTS, type Accent } from '@/lib/tokens'

type Theme = 'dark' | 'light'

interface UiState {
  theme: Theme
  accent: Accent
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setAccent: (accent: Accent) => void
}

// Global client UI state (theme + brand accent). Persisted; one of the two Zustand stores (see F0).
export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'dark',
      accent: ACCENTS[0],
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setAccent: (accent) => set({ accent }),
    }),
    { name: 'quid-ui' },
  ),
)

/** Syncs the UI store to the DOM: `.dark` class + the `--accent-brand` CSS var the tokens read. */
export function useApplyTheme() {
  const theme = useUiStore((s) => s.theme)
  const accent = useUiStore((s) => s.accent)
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.setProperty('--accent-brand', accent)
  }, [theme, accent])
}
