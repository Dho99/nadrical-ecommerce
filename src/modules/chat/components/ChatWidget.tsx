import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, LoaderCircle } from 'lucide-react'
import { cn } from '../../../shared/utils/cn'
import { Button } from '../../../shared/components/ui'
import { CHAT_OPEN_EVENT, type ChatOpenDetail, type ProductChatContext } from '../../../shared/constants/chat.constants'
import { useChat } from '../hooks/useChat'
import type { ChatIdentity } from '../types/chat.type'
import { ChatWindow } from './ChatWindow'
import { ChatInput } from './ChatInput'
import { ProductContextPreview } from './ProductContextPreview'

interface ChatWidgetProps {
  identity: ChatIdentity
}

interface TempMessage {
  id: string
  message: string
  at: Date
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export function ChatWidget({ identity }: ChatWidgetProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [productCtx, setProductCtx] = useState<ProductChatContext | null>(null)
  const [tempMessages, setTempMessages] = useState<TempMessage[]>([])
  const [sendFailed, setSendFailed] = useState(false)

  const isGuest = !identity.customer_email
  const { messages, status, sending, send, markRead } = useChat(identity)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const shownMessages = useMemo(() => {
    const msgs = messages.map((m) => ({
      id: m.id,
      message: m.message,
      sender: m.sender_role,
      time: m.created_at ? formatTime(new Date(m.created_at)) : 'now',
    }))
    const temps = tempMessages.map((t) => ({
      id: t.id,
      message: t.message,
      sender: 'customer',
      time: formatTime(t.at),
    }))
    return isGuest ? temps : msgs
  }, [isGuest, messages, tempMessages])

  const scrollBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (open) scrollBottom()
  }, [open, shownMessages.length, scrollBottom])

  useEffect(() => {
    if (open) void markRead()
  }, [open, markRead])

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ChatOpenDetail>).detail
      if (detail?.product) setProductCtx(detail.product)
      if (detail?.message) setDraft(detail.message)
      setOpen(true)
    }
    window.addEventListener(CHAT_OPEN_EVENT, handler as EventListener)
    return () => window.removeEventListener(CHAT_OPEN_EVENT, handler as EventListener)
  }, [])

  const persistGuest = (message: string) => {
    try {
      const key = 'chat-temp-messages'
      const prev: string[] = JSON.parse(localStorage.getItem(key) ?? '[]')
      localStorage.setItem(key, JSON.stringify([...prev, message]))
    } catch {
      // storage unavailable — session only
    }
  }

  const doSend = (text: string) => {
    setSendFailed(false)
    if (isGuest) {
      setTempMessages((prev) => [
        ...prev,
        { id: `tmp-${Date.now()}`, message: text, at: new Date() },
      ])
      persistGuest(text)
      setDraft('')
      return
    }
    void send(text)
      .then(() => setDraft(''))
      .catch(() => setSendFailed(true))
  }

  const canRetry = !isGuest && sendFailed

  return (
    <ChatWindow
      open={open}
      onOpenChange={setOpen}
      statusText={
        isGuest
          ? 'Halo, silakan masukkan pesan Anda'
          : 'Live support · typical reply in ~5 minutes'
      }
      className={cn(isGuest ? 'max-h-[70vh]' : 'h-[75vh] max-h-[75vh]')}
    >
      {productCtx && (
        <div className="border-b p-3">
          <ProductContextPreview product={productCtx} onClear={() => setProductCtx(null)} />
        </div>
      )}

      {isGuest && (
        <div className="border-b bg-card px-4 py-2.5">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle className="size-3.5 shrink-0" />
            Kamu belum masuk. Pesan tersimpan sementara di perangkat ini.
            <Link to="/login" className="font-medium text-primary hover:underline">
              Masuk
            </Link>{' '}
            untuk melanjutkan riwayat percakapan.
          </p>
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto bg-muted/40 p-4">
        {!isGuest && status === 'loading' && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" /> Connecting…
          </p>
        )}
        {shownMessages.length === 0 && status !== 'loading' && (
          <p className="text-center text-sm text-muted-foreground">
            {isGuest
              ? 'Kirim pesan untuk bertanya tentang produk atau pesanan.'
              : 'Start the conversation — we typically reply within minutes.'}
          </p>
        )}
        {shownMessages.map((m) => {
          const isCustomer = m.sender === 'customer'
          return (
            <div key={m.id} className={cn('flex', isCustomer && 'justify-end')}>
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm',
                  isCustomer
                    ? 'rounded-br-sm bg-primary text-primary-foreground'
                    : 'rounded-bl-sm border bg-card text-card-foreground',
                )}
              >
                <p className="leading-relaxed">{m.message}</p>
                <p
                  className={cn(
                    'mt-1 font-mono text-[10px]',
                    isCustomer ? 'text-primary-foreground/70' : 'text-muted-foreground',
                  )}
                >
                  {m.time}
                  {(m.sender === 'bot' || m.sender === 'agent') && ` · ${m.sender}`}
                </p>
              </div>
            </div>
          )
        })}
        {!isGuest && sending && (
          <p className="text-xs text-muted-foreground italic">Sending…</p>
        )}
        <div ref={bottomRef} />
      </div>

      {canRetry && (
        <div className="border-t bg-destructive/10 px-4 py-2">
          <p className="flex items-center justify-between gap-2 text-xs text-destructive">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="size-3.5" /> Pesan gagal terkirim.
            </span>
            <Button type="button" variant="outline" size="sm" className="h-6 px-2 text-[11px]" onClick={() => doSend(draft)}>
              Retry
            </Button>
          </p>
        </div>
      )}

      <ChatInput
        value={draft}
        onChange={(value) => {
          setDraft(value)
          setSendFailed(false)
        }}
        onSend={doSend}
        sending={!isGuest && sending}
      />
    </ChatWindow>
  )
}
