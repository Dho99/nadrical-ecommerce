import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, CheckCheck, LoaderCircle, Pencil, Reply } from 'lucide-react'
import { cn } from '../../../shared/utils/cn'
import { Button } from '../../../shared/components/ui'
import {
  CHAT_OPEN_EVENT,
  CHAT_PRODUCT_CONTEXTS_KEY,
  type ChatOpenDetail,
  type ProductChatContext,
} from '../../../shared/constants/chat.constants'
import { useChat } from '../hooks/useChat'
import type { ChatIdentity, ChatMessage } from '../types/chat.type'
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

function formatAvatarUrl(path?: string | null): string | null {
  if (!path) return null
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
  const baseUrl = apiBase.replace('/api/v1', '')
  if (path.startsWith('http') && path.includes('/uploads/')) {
    const cleanPath = path.substring(path.indexOf('uploads/'))
    return `${baseUrl}/${cleanPath}`
  }
  if (path.startsWith('http') || path.startsWith('data:')) return path
  const cleanPath = path.replace(/^\//, '')
  if (cleanPath.startsWith('uploads/')) {
    return `${baseUrl}/${cleanPath}`
  }
  return `${baseUrl}/uploads/${cleanPath}`
}

function getInitials(name: string): string {
  if (!name) return 'AD'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
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
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null)
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const scrollToMessage = useCallback((messageId: string) => {
    const el = document.getElementById(`nadrical-msg-${messageId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setHighlightedMessageId(messageId)
      setTimeout(() => {
        setHighlightedMessageId((cur) => (cur === messageId ? null : cur))
      }, 2000)
    }
  }, [])

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

  const {
    messages,
    status,
    sending,
    isAdminOnline,
    isAdminTyping,
    hasMore,
    isLoadingMore,
    loadMoreMessages,
    sendTyping,
    send,
    markRead,
  } = useChat(effectiveIdentity)
  const showConversation = !needsIdentity

  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const topSentinelRef = useRef<HTMLDivElement | null>(null)
  const prevScrollHeightRef = useRef<number>(0)
  const prevScrollTopRef = useRef<number>(0)
  const isPrependingRef = useRef<boolean>(false)
  const prevMessagesLengthRef = useRef<number>(messages.length)

  useEffect(() => {
    if (open) void markRead()
  }, [open, markRead, showConversation])

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_PRODUCT_CONTEXTS_KEY, JSON.stringify(productCtxs))
    } catch {
      // ignore
    }
  }, [productCtxs])

  // Initial scroll to bottom when chat opens
  useEffect(() => {
    if (open && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }, [open])

  // Scroll preservation on prepending older messages vs auto-scroll on new message
  useLayoutEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    if (isPrependingRef.current) {
      const newScrollHeight = container.scrollHeight
      const heightDiff = newScrollHeight - prevScrollHeightRef.current
      container.scrollTop = prevScrollTopRef.current + heightDiff
      isPrependingRef.current = false
    } else if (messages.length > prevMessagesLengthRef.current) {
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
      const lastMsg = messages[messages.length - 1]
      if (distanceFromBottom < 160 || lastMsg?.sender_role === 'customer') {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
      }
    }
    prevMessagesLengthRef.current = messages.length
  }, [messages])

  // Auto-scroll when admin starts typing so indicator is never clipped or overlapped
  useEffect(() => {
    if (isAdminTyping && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [isAdminTyping])

  // Older messages fetch trigger
  const handleLoadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isPrependingRef.current) return
    const container = scrollContainerRef.current
    if (!container) return

    prevScrollHeightRef.current = container.scrollHeight
    prevScrollTopRef.current = container.scrollTop
    isPrependingRef.current = true

    try {
      await loadMoreMessages()
    } catch {
      isPrependingRef.current = false
    }
  }, [hasMore, isLoadingMore, loadMoreMessages])

  // Sentinel observer
  useEffect(() => {
    const sentinel = topSentinelRef.current
    const container = scrollContainerRef.current
    if (!sentinel || !container || !hasMore || isLoadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void handleLoadMore()
        }
      },
      {
        root: container,
        rootMargin: '80px 0px 0px 0px',
        threshold: 0.1,
      },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, isLoadingMore, handleLoadMore])

  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return
    if (container.scrollTop <= 50 && hasMore && !isLoadingMore && !isPrependingRef.current) {
      void handleLoadMore()
    }
  }

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
    const replyTarget = replyingTo
    setReplyingTo(null)
    const activeProduct = productCtxs.length > 0 ? productCtxs[productCtxs.length - 1] : undefined
    void send(text, activeProduct, replyTarget, productCtxs)
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
        guest && needsIdentity
          ? 'Mulai percakapan sebagai tamu'
          : isAdminTyping
          ? 'Admin sedang mengetik...'
          : isAdminOnline
          ? 'Admin Online · Live support'
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

          {productCtxs.length > 0 && (
            <div className="border-b bg-card px-3 py-2 space-y-1.5 max-h-36 overflow-y-auto">
              {productCtxs.map((ctx) => (
                <ProductContextPreview
                  key={`${ctx.id}-${ctx.added_at ?? ''}`}
                  product={ctx}
                  onClear={() => removeCtx(ctx.added_at, ctx.id)}
                />
              ))}
            </div>
          )}

          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 space-y-1.5 overflow-y-auto bg-muted/40 p-4"
          >
            {hasMore && <div ref={topSentinelRef} className="h-1 w-full pointer-events-none" />}

            {isLoadingMore && (
              <div className="flex items-center justify-center py-2 text-xs text-muted-foreground gap-2">
                <LoaderCircle className="size-3.5 animate-spin text-primary" />
                <span>Memuat riwayat chat...</span>
              </div>
            )}

            {!hasMore && messages.length >= 20 && (
              <div className="flex items-center justify-center py-2 text-[11px] text-muted-foreground/60 select-none">
                <span>— Awal percakapan —</span>
              </div>
            )}

            {status === 'loading' && messages.length === 0 && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" /> Connecting…
              </p>
            )}

            {messages.length === 0 && status !== 'loading' && (
              <p className="text-center text-sm text-muted-foreground">
                Start the conversation — we typically reply within minutes.
              </p>
            )}

            {messages.map((m, idx) => {
              const isCustomer = m.sender_role === 'customer'
              const isHighlighted = highlightedMessageId === m.id
              const adminName = m.sender_name || (m.sender_role === 'bot' ? 'Bot Asisten' : 'Admin')
              const avatarUrl = formatAvatarUrl(m.sender_avatar)
              const initials = getInitials(adminName)

              const prevMsg = idx > 0 ? messages[idx - 1] : null
              const isSameSender =
                prevMsg != null &&
                prevMsg.sender_role === m.sender_role &&
                (isCustomer
                  ? true
                  : (m.sender_user_id && prevMsg.sender_user_id
                      ? m.sender_user_id === prevMsg.sender_user_id
                      : (m.sender_name || 'Admin') === (prevMsg.sender_name || 'Admin')))

              const timeDiff =
                prevMsg && m.created_at && prevMsg.created_at
                  ? Math.abs(new Date(m.created_at).getTime() - new Date(prevMsg.created_at).getTime())
                  : 0
              const isGroupedWithPrev = isSameSender && timeDiff < 5 * 60 * 1000
              const showAdminInfo = !isCustomer && !isGroupedWithPrev

              return (
                <div
                  key={m.id}
                  className={cn(
                    'group relative flex items-start gap-2',
                    isCustomer ? 'justify-end' : 'justify-start',
                    !isGroupedWithPrev && idx > 0 && 'pt-2.5',
                  )}
                >
                  {/* Foto Admin di sebelah kiri bubble chat - hanya muncul 1x per rangkaian pesan */}
                  {!isCustomer && (
                    showAdminInfo ? (
                      <div className="shrink-0 mt-1 select-none" title={adminName}>
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={adminName}
                            className="size-7.5 rounded-full object-cover ring-1 ring-border shadow-xs"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none'
                            }}
                          />
                        ) : (
                          <span className="flex size-7.5 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px] ring-1 ring-primary/20 shadow-xs">
                            {initials}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="size-7.5 shrink-0 select-none" aria-hidden="true" />
                    )
                  )}

                  {isCustomer && (
                    <button
                      type="button"
                      onClick={() => setReplyingTo(m)}
                      className="opacity-0 group-hover:opacity-100 transition p-1 text-muted-foreground hover:text-foreground shrink-0 self-end"
                      title="Balas pesan"
                    >
                      <Reply className="size-3.5" />
                    </button>
                  )}

                  <div className={cn('flex flex-col', isCustomer ? 'items-end max-w-[80%]' : 'items-start max-w-[78%]')}>
                    {/* Nama Admin di sebelah kiri/atas bubble chat - hanya muncul 1x per rangkaian pesan */}
                    {showAdminInfo && (
                      <span className="text-[11px] font-semibold text-foreground/85 mb-1 px-1 leading-tight">
                        {adminName}
                      </span>
                    )}

                    <div
                      id={`nadrical-msg-${m.id}`}
                      className={cn(
                        'w-full rounded-2xl px-3.5 py-2 text-sm shadow-sm transition-all duration-300',
                        isHighlighted && (
                          isCustomer
                            ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-background brightness-110 shadow-lg animate-pulse scale-[1.01]'
                            : 'ring-2 ring-primary ring-offset-2 ring-offset-background bg-primary/20 shadow-lg animate-pulse scale-[1.01]'
                        ),
                        isCustomer
                          ? 'rounded-br-sm bg-primary text-primary-foreground'
                          : 'rounded-tl-xs rounded-bl-sm border bg-card text-card-foreground',
                      )}
                    >
                      {m.reply_to && (
                        <div
                          role="button"
                          tabIndex={0}
                          title="Menuju ke pesan asli"
                          onClick={(e) => {
                            e.stopPropagation()
                            const targetId = m.reply_to_id || m.reply_to?.id
                            if (targetId) {
                              scrollToMessage(targetId)
                            }
                          }}
                          className={cn(
                            'mb-1.5 rounded border-l-2 py-1 px-2 text-xs cursor-pointer select-none transition-all hover:opacity-85 active:scale-[0.98]',
                            isCustomer
                              ? 'border-primary-foreground/60 bg-black/10 text-primary-foreground/90 hover:bg-black/20'
                              : 'border-primary bg-muted/60 text-muted-foreground hover:bg-muted/80',
                          )}
                        >
                          <p className="font-semibold text-[10px]">
                            {m.reply_to.sender_role === 'customer' ? 'Customer' : 'Admin'}
                          </p>
                          <p className="line-clamp-2 truncate">{m.reply_to.message}</p>
                        </div>
                      )}
                      <p className="leading-relaxed">{m.message}</p>
                      {m.attachments?.some((a) => a.type === 'product') && (
                        <p className="mt-1.5 flex flex-wrap gap-1">
                          {m.attachments
                            .filter((a) => a.type === 'product')
                            .map((a) => {
                              const meta = a.metadata as unknown as ProductChatContext | undefined
                              return (
                                <span
                                  key={a.id}
                                  className={cn(
                                    'rounded-full border px-2 py-0.5 text-[11px] font-medium',
                                    isCustomer
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
                      <div
                        className={cn(
                          'mt-1 flex items-center justify-end gap-1 font-mono text-[10px]',
                          isCustomer ? 'text-primary-foreground/70' : 'text-muted-foreground',
                        )}
                      >
                        <span>
                          {m.created_at ? formatTime(new Date(m.created_at)) : 'now'}
                          {m.sender_role === 'bot' && ' · bot'}
                        </span>
                        {isCustomer && (
                          <CheckCheck
                            className={cn(
                              'size-3.5',
                              m.is_read ? 'text-sky-300' : 'text-primary-foreground/50',
                            )}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {!isCustomer && (
                    <button
                      type="button"
                      onClick={() => setReplyingTo(m)}
                      className="opacity-0 group-hover:opacity-100 transition p-1 text-muted-foreground hover:text-foreground shrink-0 self-end"
                      title="Balas pesan"
                    >
                      <Reply className="size-3.5" />
                    </button>
                  )}
                </div>
              )
            })}
            {isAdminTyping && (
              <div className="flex items-end gap-2 pb-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-foreground">
                  SA
                </span>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-border bg-card px-3.5 py-2 shadow-xs">
                  <span className="text-xs text-muted-foreground mr-1">Admin sedang mengetik</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                </div>
              </div>
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
              sendTyping(Boolean(value.trim()))
            }}
            onSend={doSend}
            sending={sending}
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
          />
        </>
      )}
    </ChatWindow>
  )
}
