import type { ReactNode } from 'react'
import { cn } from '../utils/cn'
import { useMediaQuery } from '../hooks/useMediaQuery'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './ui/sheet'

interface ResponsiveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  desktopClassName?: string
  mobileClassName?: string
  bodyClassName?: string
}

export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  desktopClassName,
  mobileClassName,
  bodyClassName,
}: ResponsiveDialogProps) {
  const isMobile = useMediaQuery('(max-width: 767px)')

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className={cn('max-h-[92dvh] gap-0 rounded-t-2xl border-t p-0', mobileClassName)}
        >
          <div className="mx-auto mt-2 h-1.5 w-12 shrink-0 rounded-full bg-muted" />
          <SheetHeader className="px-5 pt-2 pr-12">
            <SheetTitle className="font-display text-xl font-bold tracking-tight">{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
          <div className={cn('min-h-0 flex-1 overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)]', bodyClassName)}>
            {children}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('max-h-[90dvh] overflow-y-auto sm:max-w-lg', desktopClassName)}>
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold tracking-tight">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className={bodyClassName}>{children}</div>
      </DialogContent>
    </Dialog>
  )
}
