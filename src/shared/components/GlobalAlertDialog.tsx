import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog'
import { useAlertStore } from '../stores/alert.store'

export function GlobalAlertDialog() {
  const { open, title, description, variant, actionLabel, onAction, close } = useAlertStore()

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && close()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className={variant === 'destructive' ? 'text-destructive' : ''}>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={close}>Tutup</AlertDialogCancel>
          {actionLabel && (
            <AlertDialogAction
              onClick={() => {
                onAction?.()
                close()
              }}
            >
              {actionLabel}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
