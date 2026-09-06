import type { ReactNode } from 'react'
import { Headset, MessageCircle, X } from 'lucide-react'
import { Button } from '../../../shared/components/ui'
import { cn } from '../../../shared/utils/cn'

interface ChatWindowProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  className?: string
  statusText?: string
}

export function ChatWindow({ open, onOpenChange, children, className, statusText }: ChatWindowProps) {
  return (
    <>
      {!open && (
        <Button
          type="button"
          size="icon"
          onClick={() => onOpenChange(true)}
          aria-label="Open live chat"
          className="fixed right-5 bottom-5 z-50 size-14 rounded-full shadow-lg"
        >
          <MessageCircle className="size-6" />
        </Button>
      )}

      {open && (
        <div
          className={cn(
            'fixed right-5 bottom-5 z-50 flex w-[min(100vw-2rem,24rem)] flex-col overflow-hidden rounded-xl border bg-background shadow-2xl',
            className ?? 'max-h-[75vh]',
          )}
          role="dialog"
          aria-modal="false"
          aria-label="Live chat"
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Headset className="size-5 text-primary" />
              <h2 className="font-display text-base font-bold tracking-tight">Chat with us</h2>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onOpenChange(false)}
              aria-label="Close chat"
            >
              <X className="size-4" />
            </Button>
          </div>
          <p className="border-b bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
            {statusText ?? 'Live support · typical reply in ~5 minutes'}
          </p>
          {children}
        </div>
      )}
    </>
  )
}
