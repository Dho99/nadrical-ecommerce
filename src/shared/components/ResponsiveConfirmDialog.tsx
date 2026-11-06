import type { ReactNode } from 'react'
import { cn } from '../utils/cn'
import { useMediaQuery } from '../hooks/useMediaQuery'
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
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet'

interface ResponsiveConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  cancelLabel?: string
  confirmLabel?: string
  onCancel?: () => void
  onConfirm?: () => void
  destructive?: boolean
  confirmDisabled?: boolean
  cancelDisabled?: boolean
  children?: ReactNode
}

export function ResponsiveConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelLabel = 'Batal',
  confirmLabel,
  onCancel,
  onConfirm,
  destructive = false,
  confirmDisabled = false,
  cancelDisabled = false,
  children,
}: ResponsiveConfirmDialogProps) {
  const isMobile = useMediaQuery('(max-width: 767px)')

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="max-h-[92dvh] gap-0 rounded-t-2xl border-t p-0"
          role="alertdialog"
        >
          <div className="mx-auto mt-2 h-1.5 w-12 shrink-0 rounded-full bg-muted" />
          <SheetHeader className="px-5 pt-2 text-center sm:text-left">
            <SheetTitle className={cn('font-display text-xl font-bold tracking-tight', destructive && 'text-destructive')}>
              {title}
            </SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
          {children && <div className="px-5 pt-3">{children}</div>}
          <div className="mt-3 flex flex-col-reverse gap-2 border-t bg-popover px-5 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            <Button
              variant="outline"
              disabled={cancelDisabled}
              onClick={() => {
                onCancel?.()
                onOpenChange(false)
              }}
            >
              {cancelLabel}
            </Button>
            {confirmLabel && (
              <Button
                variant={destructive ? 'destructive' : 'default'}
                disabled={confirmDisabled}
                onClick={() => {
                  onConfirm?.()
                  onOpenChange(false)
                }}
              >
                {confirmLabel}
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className={cn(destructive && 'text-destructive')}>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={cancelDisabled} onClick={onCancel}>
            {cancelLabel}
          </AlertDialogCancel>
          {confirmLabel && (
            <AlertDialogAction
              disabled={confirmDisabled}
              className={cn(destructive && 'bg-destructive text-destructive-foreground hover:bg-destructive/90')}
              onClick={onConfirm}
            >
              {confirmLabel}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
