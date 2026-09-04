import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Headset, LoaderCircle, MessageCircle, Send, X } from 'lucide-react'
import { cn } from '../../../shared/utils/cn'
import { Button, Input } from '../../../shared/components/ui'
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
  const [guestName, setGuestName] = useState(() => {
    try {
      return localStorage.getItem('chat-guest-name') ?? ''
    } catch {
      return ''
    }
  })
  const [guestPhone, setGuestPhone] = useState(() => {
    try {
      return localStorage.getItem('chat-guest-phone') ?? ''
    } catch {
      return ''
    }
  })
  const [gateError, setGateError] = useState<string | null>(null)

  const isGuest = !identity.customer_email || identity.customer_name === 'Guest'

  const effectiveIdentity: ChatIdentity = useMemo(() => {
    if (!isGuest) return identity
    return {
      customer_user_id: identity.customer_user_id,
      customer_name: guestName.trim() || identity.customer_name,
      customer_email: identity.customer_email,
      customer_phone: guestPhone.trim() || undefined,
    }
  }, [identity, isGuest, guestName, guestPhone])

  const { messages, status, sending, send, markRead } = useChat(effectiveIdentity)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, open])

  useEffect(() => {
    if (open) void markRead()
  }, [open, markRead])

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ message?: string; productId?: string }>).detail
      if (detail?.message) setDraft(detail.message)
      setOpen(true)
      if (detail?.message) void send(detail.message)
    }
    window.addEventListener('nadrical:open-chat', handler as EventListener)
    return () => window.removeEventListener('nadrical:open-chat', handler as EventListener)
  }, [send])

  useEffect(() => {
    try {
      if (guestName) localStorage.setItem('chat-guest-name', guestName)
      else localStorage.removeItem('chat-guest-name')
    } catch {
      // ignore storage errors
      void 0
    }
  }, [guestName])

  useEffect(() => {
    try {
      if (guestPhone) localStorage.setItem('chat-guest-phone', guestPhone)
      else localStorage.removeItem('chat-guest-phone')
    } catch {
      // ignore storage errors
      void 0
    }
  }, [guestPhone])

  const validateGate = (): boolean => {
    if (!isGuest) return true
    if (!guestName.trim()) {
      setGateError('Nama harus diisi')
      return false
    }
    if (!guestPhone.trim()) {
      setGateError('Nomor HP harus diisi')
      return false
    }
    if (!/^\+?[0-9\s-]{8,15}$/.test(guestPhone.trim())) {
      setGateError('Nomor HP tidak valid (8-15 digit)')
      return false
    }
    setGateError(null)
    return true
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!validateGate()) return
    if (!draft.trim()) return
    void send(draft)
    setDraft('')
    setGateError(null)
  }

  const canSend = isGuest ? guestName.trim() !== '' && guestPhone.trim() !== '' && draft.trim() !== '' : draft.trim() !== ''

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

      {open && (
        <div className="fixed right-5 bottom-5 z-50 flex h-[75vh] max-h-[75vh] w-[min(100vw-2rem,24rem)] flex-col overflow-hidden rounded-xl border bg-background shadow-2xl">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Headset className="size-5 text-primary" />
              <h2 className="font-display text-base font-bold tracking-tight">Chat with us</h2>
            </div>
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => setOpen(false)} aria-label="Close chat">
              <X className="size-4" />
            </Button>
          </div>
          <p className="border-b bg-muted/40 px-4 py-2 text-xs text-muted-foreground">Live support · typical reply in ~5 minutes</p>

          {isGuest && (
            <div className="space-y-2 border-b bg-card p-3">
              <p className="text-xs font-medium">Sebelum chat, isi data Anda:</p>
              <Input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Nama"
                aria-label="Nama"
                className="h-9"
              />
              <Input
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="Nomor HP"
                aria-label="Nomor HP"
                type="tel"
                className="h-9"
              />
              {gateError && <p role="alert" className="text-xs text-destructive">{gateError}</p>}
            </div>
          )}

          <div className="flex-1 space-y-3 overflow-y-auto bg-muted/40 p-4">
            {status === 'loading' && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" /> Connecting…
              </p>
            )}
            {messages.map((message) => {
              const isCustomer = message.sender_role === 'customer'
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
                    <p className="leading-relaxed">{message.message}</p>
                    <p
                      className={cn(
                        'mt-1 font-mono text-[10px]',
                        isCustomer ? 'text-primary-foreground/70' : 'text-muted-foreground',
                      )}
                    >
                      {formatTime(message.created_at || '')}
                      {message.sender_role === 'bot' && ' · bot'}
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

          <form onSubmit={onSubmit} className="flex items-center gap-2 border-t bg-background p-3">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type your message…"
              aria-label="Chat message"
              className="h-10"
            />
            <Button type="submit" size="icon" className="size-10 shrink-0" disabled={sending || !canSend}>
              {sending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </form>
        </div>
      )}
    </>
  )
}
