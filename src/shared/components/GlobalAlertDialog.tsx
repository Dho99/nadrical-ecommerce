import { useAlertStore } from '../stores/alert.store'
import { ResponsiveConfirmDialog } from './ResponsiveConfirmDialog'

export function GlobalAlertDialog() {
  const { open, title, description, variant, actionLabel, onAction, close } = useAlertStore()

  return (
    <ResponsiveConfirmDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close()
      }}
      title={title}
      description={description}
      cancelLabel="Tutup"
      confirmLabel={actionLabel}
      destructive={variant === 'destructive'}
      onCancel={close}
      onConfirm={() => {
        onAction?.()
        close()
      }}
    />
  )
}
