import { LogoutIcon } from '@/components/icons'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { SegmentedControl } from '@/components/SegmentedControl'
import { useAuthStore } from '@/store/authStore'
import { signOut } from '@/features/auth/session'
import { useUiStore } from '@/store/uiStore'
import { initials } from '@/lib/format'

/** Workspace avatar + popover: identity, appearance toggle, logout. Ported from prototype. */
export function WorkspaceMenu() {
  const user = useAuthStore((s) => s.user)
  const { theme, setTheme } = useUiStore()
  if (!user) return null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="relative size-[38px] cursor-pointer" aria-label="Workspace menu">
          <span className="grid size-full place-items-center rounded-full bg-primary text-[13px] font-extrabold text-primary-foreground transition-[filter] hover:brightness-110">
            {initials(user.workspaceName)}
          </span>
          <span className="absolute -right-px -top-px size-2.5 rounded-full border-2 border-sidebar bg-[#4ADE80]" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="right" align="end" className="w-[210px] rounded-[14px] p-2.5">
        <div className="mb-2 flex items-center gap-2.5 border-b border-border pb-2.5">
          <div className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-extrabold text-primary-foreground">
            {initials(user.workspaceName)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-bold">{user.workspaceName}</div>
            <div className="text-[11px] capitalize text-text-3">{user.role.toLowerCase()}</div>
          </div>
        </div>
        <div className="mb-2 px-1 text-[10.5px] font-bold uppercase tracking-[0.05em] text-text-3">Appearance</div>
        <SegmentedControl
          fluid
          className="mb-2"
          value={theme}
          onChange={setTheme}
          segments={[
            { value: 'dark', label: 'Dark' },
            { value: 'light', label: 'Light' },
          ]}
        />
        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-2.5 rounded-[9px] px-2 py-1.5 text-left text-[13px] font-semibold text-destructive hover:bg-accent"
        >
          <LogoutIcon size={15} />
          Log out
        </button>
      </PopoverContent>
    </Popover>
  )
}
