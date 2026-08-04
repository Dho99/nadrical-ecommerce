import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Headset, LoaderCircle, MessageCircle, Send } from 'lucide-react'
import { cn } from '../../../shared/utils/cn'
import { Button, Input, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../../../shared/components/ui'
import { useChat } from '../hooks/useChat'
import type { ChatIdentity } from '../types/chat.type'

interface ChatWidgetProps {
  identity: ChatIdentity
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export function ChatWidget({ identity }: ChatWidgetProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const { messages, status, sending, send, markRead } = useChat(identity)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, open])

  useEffect(() => {
    if (open) void markRead()
  }, [open, markRead])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void send(draft)
    setDraft('')
  }

  return (
    <>
      {!open && (
        <Button
          type="button"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label="Open live chat"
          className="fixed right-5 bottom-5 z-50 size-14 rounded-full shadow-lg"
        >
          <MessageCircle className="size-6" />
        </Button>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-sm">
          <SheetHeader className="border-b px-5 py-4">
            <div className="flex items-center gap-2">
              <Headset className="size-5 text-primary" />
              <SheetTitle className="font-display text-lg font-bold tracking-tight">
                Chat with us
              </SheetTitle>
            </div>
            <SheetDescription className="text-xs">
              Live support · typical reply in ~5 minutes
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-3 overflow-y-auto bg-muted/40 p-4">
            {status === 'loading' && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" /> Connecting…
              </p>
            )}
            {messages.map((message) => {
              const isCustomer = message.role === 'customer'
              return (
                <div
                  key={message.id}
                  className={cn('flex', isCustomer && 'justify-end')}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm',
                      isCustomer
                        ? 'rounded-br-sm bg-primary text-primary-foreground'
                        : 'rounded-bl-sm border bg-card text-card-foreground',
                    )}
                  >
                    <p className="leading-relaxed">{message.text}</p>
                    <p
                      className={cn(
                        'mt-1 font-mono text-[10px]',
                        isCustomer ? 'text-primary-foreground/70' : 'text-muted-foreground',
                      )}
                    >
                      {formatTime(message.at)}
                      {message.role === 'bot' && ' · bot'}
                    </p>
                  </div>
                </div>
              )
            })}
            {sending && (
              <p className="text-xs text-muted-foreground italic">Sending…</p>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={onSubmit} className="flex items-center gap-2 border-t p-3">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type your message…"
              aria-label="Chat message"
              className="h-10"
            />
            <Button type="submit" size="icon" className="size-10 shrink-0" disabled={sending || !draft.trim()}>
              {sending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
