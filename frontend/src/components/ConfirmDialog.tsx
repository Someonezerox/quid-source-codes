import { AlertTriangle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  loading?: boolean
  onConfirm: () => void
}

/** Reusable confirmation modal — replaces window.confirm for anything irreversible. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => !loading && onOpenChange(o)}>
      <DialogContent className="gap-0 p-0 sm:max-w-[420px]" showCloseButton={false}>
        <DialogHeader className="flex-row items-start gap-3.5 p-5">
          {destructive && (
            <span className="grid size-10 shrink-0 place-items-center rounded-[12px] border border-destructive/25 bg-destructive/10 text-destructive">
              <AlertTriangle size={20} />
            </span>
          )}
          <div className="space-y-1.5 pt-0.5">
            <DialogTitle className="text-[16px] font-extrabold tracking-tight">{title}</DialogTitle>
            {description && <DialogDescription className="text-[13px] leading-relaxed">{description}</DialogDescription>}
          </div>
        </DialogHeader>
        <div className="flex justify-end gap-2.5 border-t border-border px-5 py-4">
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={destructive ? 'destructive' : 'default'} onClick={onConfirm} disabled={loading}>
            {loading ? 'Working…' : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
