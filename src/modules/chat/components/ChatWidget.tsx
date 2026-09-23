import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, LoaderCircle, Pencil } from 'lucide-react'
import { cn } from '../../../shared/utils/cn'
import { Button } from '../../../shared/components/ui'
import {
  CHAT_OPEN_EVENT,
  CHAT_PRODUCT_CONTEXTS_KEY,
  type ChatOpenDetail,
  type ProductChatContext,
} from '../../../shared/constants/chat.constants'
import { useChat } from '../hooks/useChat'
import type { ChatIdentity } from '../types/chat.type'
import type { GuestProfileInput } from '../schemas/guest.schema'
import { GUEST_PROFILE_KEY } from '../constants/chat.constants'
import { ChatWindow } from './ChatWindow'
import { ChatInput } from './ChatInput'
import { ProductContextPreview } from './ProductContextPreview'
import { GuestIdentityForm } from './GuestIdentityForm'

interface ChatWidgetProps {
  identity: ChatIdentity
  isGuest?: boolean
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function loadProfile(): GuestProfileInput | null {
  try {
    const raw = localStorage.getItem(GUEST_PROFILE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as GuestProfileInput
    return parsed?.name && parsed?.email ? parsed : null
  } catch {
    return null
  }
}

function loadContexts(): ProductChatContext[] {
  try {
    const raw = localStorage.getItem(CHAT_PRODUCT_CONTEXTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    const now = new Date().toISOString()
    return parsed
      .filter((p): p is ProductChatContext => Boolean(p && typeof (p as ProductChatContext).id === 'string'))
      .map((p) => ({ ...p, added_at: p.added_at ?? now }))
      .slice(-5)
  } catch {
    return []
  }
}

export function ChatWidget({ identity, isGuest }: ChatWidgetProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [productCtxs, setProductCtxs] = useState<ProductChatContext[]>(() => loadContexts())
  const [sendFailed, setSendFailed] = useState(false)
  const [guestProfile, setGuestProfile] = useState<GuestProfileInput | null>(() => loadProfile())
  const [editingProfile, setEditingProfile] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const guest = isGuest ?? !identity.customer_email
  const needsIdentity = guest && !guestProfile

  const effectiveIdentity: ChatIdentity = useMemo(() => {
    if (!guest) return identity
    if (!guestProfile) return identity
    return {
      customer_user_id: identity.customer_user_id,
      customer_name: guestProfile.name,
      customer_email: guestProfile.email,
      customer_phone: guestProfile.phone || undefined,
    }
  }, [guest, identity, guestProfile])

  const { messages, status, sending, send, markRead } = useChat(effectiveIdentity)
  const showConversation = !needsIdentity

  const timeline = useMemo(() => {
    const products = productCtxs.map((ctx) => ({
      kind: 'product' as const,
      ts: ctx.added_at ?? '',
      key: `product-${ctx.id}-${ctx.added_at}`,
      ctx,
    }))
    const chats = messages.map((m) => ({
      kind: 'message' as const,
      ts: m.created_at ?? '',
      key: `msg-${m.id}`,
      m,
    }))
    return [...products, ...chats].sort((a, b) => a.ts.localeCompare(b.ts))
  }, [productCtxs, messages])

  useEffect(() => {
    if (open) void markRead()
  }, [open, markRead, showConversation])

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [open, timeline.length, showConversation])

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_PRODUCT_CONTEXTS_KEY, JSON.stringify(productCtxs))
    } catch {
      // ignore
    }
  }, [productCtxs])

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ChatOpenDetail>).detail
      if (detail?.product) {
        const incoming: ProductChatContext = { ...detail.product, added_at: new Date().toISOString() }
        setProductCtxs((prev) => [...prev, incoming].slice(-5))
      }
      if (detail?.message) setDraft(detail.message)
      setOpen(true)
    }
    window.addEventListener(CHAT_OPEN_EVENT, handler as EventListener)
    return () => window.removeEventListener(CHAT_OPEN_EVENT, handler as EventListener)
  }, [])

  const saveProfile = (values: GuestProfileInput) => {
    setGuestProfile(values)
    setEditingProfile(false)
    try {
      localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(values))
    } catch {
      // storage unavailable — keep in-memory
    }
  }

  const doSend = (text: string) => {
    if (needsIdentity) return
    setSendFailed(false)
    const active = productCtxs.length > 0 ? [productCtxs[productCtxs.length - 1]] : undefined
    void send(text, active)
      .then(() => setDraft(''))
      .catch(() => setSendFailed(true))
  }

  const removeCtx = (addedAt: string | undefined, id: string) => {
    setProductCtxs((prev) => prev.filter((p) => !(p.id === id && p.added_at === addedAt)))
  }

  return (
    <ChatWindow
      open={open}
      onOpenChange={setOpen}
      statusText={
        guest
          ? needsIdentity
            ? 'Mulai percakapan sebagai tamu'
            : 'Live support · typical reply in ~5 minutes'
          : 'Live support · typical reply in ~5 minutes'
      }
      className={cn(guest && needsIdentity ? 'max-h-[80vh]' : guest && guestProfile ? 'h-[70vh] max-h-[70vh]' : 'h-[75vh] max-h-[75vh]')}
    >
      {guest && needsIdentity && (
        <GuestIdentityForm
          initialValues={guestProfile ?? undefined}
          onSubmit={saveProfile}
          onLogin={() => setOpen(false)}
        />
      )}

      {guest && !needsIdentity && editingProfile && (
        <GuestIdentityForm
          initialValues={guestProfile ?? undefined}
          onSubmit={saveProfile}
          onLogin={() => setOpen(false)}
        />
      )}

      {showConversation && !editingProfile && (
        <>
          {guest && guestProfile && (
            <div className="flex items-center justify-between gap-2 border-b bg-card px-4 py-1.5">
              <p className="truncate text-xs text-muted-foreground">
                Chat sebagai <span className="font-medium text-foreground">{guestProfile.name}</span> ·{' '}
                {guestProfile.email}
              </p>
              <button
                type="button"
                onClick={() => setEditingProfile(true)}
                className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <Pencil className="size-3" /> Ubah data diri
              </button>
            </div>
          )}

          <div className="flex-1 space-y-3 overflow-y-auto bg-muted/40 p-4">
            {status === 'loading' && messages.length === 0 && timeline.length === 0 && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" /> Connecting…
              </p>
            )}
            {timeline.length === 0 && status !== 'loading' && (
              <p className="text-center text-sm text-muted-foreground">
                Start the conversation — we typically reply within minutes.
              </p>
            )}
            {timeline.map((item) =>
              item.kind === 'product' ? (
                <div key={item.key}>
                  <ProductContextPreview product={item.ctx} onClear={() => removeCtx(item.ctx.added_at, item.ctx.id)} />
                  <p className="mt-1 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                    {item.ctx.added_at ? formatTime(new Date(item.ctx.added_at)) : ''} · Membahas produk ini
                  </p>
                </div>
              ) : (
                <div key={item.key} className={cn('flex', item.m.sender_role === 'customer' && 'justify-end')}>
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm',
                      item.m.sender_role === 'customer'
                        ? 'rounded-br-sm bg-primary text-primary-foreground'
                        : 'rounded-bl-sm border bg-card text-card-foreground',
                    )}
                  >
                    <p className="leading-relaxed">{item.m.message}</p>
                    {item.m.attachments?.some((a) => a.type === 'product') && (
                      <p className="mt-1.5 flex flex-wrap gap-1">
                        {item.m.attachments
                          .filter((a) => a.type === 'product')
                          .map((a) => {
                            const meta = a.metadata as unknown as ProductChatContext | undefined
                            return (
                              <span
                                key={a.id}
                                className={cn(
                                  'rounded-full border px-2 py-0.5 text-[11px] font-medium',
                                  item.m.sender_role === 'customer'
                                    ? 'border-primary-foreground/20 bg-primary-foreground/15 text-primary-foreground'
                                    : 'border-border bg-muted text-muted-foreground',
                                )}
                              >
                                {meta?.name ?? a.value}
                              </span>
                            )
                          })}
                      </p>
                    )}
                    <p
                      className={cn(
                        'mt-1 font-mono text-[10px]',
                        item.m.sender_role === 'customer' ? 'text-primary-foreground/70' : 'text-muted-foreground',
                      )}
                    >
                      {item.m.created_at ? formatTime(new Date(item.m.created_at)) : 'now'}
                      {item.m.sender_role === 'bot' && ' · bot'}
                    </p>
                  </div>
                </div>
              ),
            )}
            {sending && <p className="text-xs text-muted-foreground italic">Sending…</p>}
            <div ref={bottomRef} />
          </div>

          {productCtxs.length > 1 && (
            <div className="border-t bg-background px-3 py-1.5">
              <button
                type="button"
                onClick={() => setProductCtxs([])}
                className="w-full text-center text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
              >
                Clear all products
              </button>
            </div>
          )}

          {sendFailed && (
            <div className="border-t bg-destructive/10 px-4 py-2">
              <p className="flex items-center justify-between gap-2 text-xs text-destructive">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="size-3.5" /> Pesan gagal terkirim.
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-[11px]"
                  onClick={() => doSend(draft)}
                >
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
            sending={sending}
          />
        </>
      )}
    </ChatWindow>
  )
}
