import { useState, type FormEvent } from 'react'
import { LoaderCircle, MessageSquare, Send } from 'lucide-react'
import { cn } from '../../../shared/utils/cn'
import { Button, Input, Skeleton } from '../../../shared/components/ui'
import { useChatInbox } from '../hooks/useChatInbox'
import type { ChatConversation } from '../../chat/types/chat.type'
import { ListPagination } from './ListPagination'

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function unreadForAgent(conversation: ChatConversation): number {
  const readAt = conversation.agent_read_at ?? conversation.created_at ?? ''
  return conversation.messages.filter((m) => m.sender_role === 'customer' && Date.parse(m.created_at || '') > Date.parse(readAt)).length
}

export function ChatInbox() {
  const { conversations, total, pageStart, status, active, activeId, open, sendReply, goNext, goPrev } =
    useChatInbox()
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text || !activeId) return
    setSending(true)
    try {
      await sendReply(text)
      setDraft('')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="grid min-h-[28rem] overflow-hidden rounded-xl border bg-card lg:grid-cols-[17rem_1fr]">
      <aside className="border-b lg:border-r lg:border-b-0">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <MessageSquare className="size-4 text-primary" />
          <h2 className="font-display text-sm font-bold tracking-tight">Conversations</h2>
          <span className="ml-auto rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            {conversations.length}
          </span>
        </div>
        <div className="max-h-[24rem] overflow-y-auto lg:max-h-[32rem]">
          {status === 'loading' &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2 border-b p-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          {status === 'success' && total === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              No conversations yet. Customers chatting from the storefront will appear here.
            </p>
          )}
          {conversations.map((conversation) => {
            const last = conversation.messages[conversation.messages.length - 1]
            const unread = unreadForAgent(conversation)
            const isActive = conversation.id === activeId
            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => open(conversation.id)}
                className={cn(
                  'w-full border-b px-4 py-3 text-left transition-colors',
                  isActive ? 'bg-accent' : 'hover:bg-muted/50',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{conversation.customer_name}</p>
                  {unread > 0 && (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {unread}
                    </span>
                  )}
                </div>
                {last && <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{last.message}</p>}
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                  {formatTime(conversation.last_activity_at || '')}
                </p>
              </button>
            )
          })}
          <ListPagination
            pageStart={pageStart}
            pageEnd={pageStart + conversations.length - 1}
            total={total}
            onPrev={goPrev}
            onNext={goNext}
          />
        </div>
      </aside>

      <section className="flex min-w-0 flex-col">
        {active ? (
          <>
            <div className="border-b px-4 py-3">
              <p className="truncate text-sm font-medium">{active.customer_name}</p>
              <p className="truncate font-mono text-xs text-muted-foreground">
                {active.customer_email ?? active.customer_user_id}
              </p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto bg-muted/40 p-4">
              {active.messages.map((message) => {
                const isCustomer = message.sender_role === 'customer'
                return (
                  <div key={message.id} className={cn('flex', isCustomer && 'justify-end')}>
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
                        {message.sender_role === 'agent' && ' · you'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
            <form onSubmit={onSubmit} className="flex items-center gap-2 border-t p-3">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Reply as agent…"
                aria-label="Agent reply"
                className="h-10"
              />
              <Button type="submit" size="icon" className="size-10 shrink-0" disabled={sending || !draft.trim()}>
                {sending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex grow flex-col items-center justify-center gap-2 p-10 text-center">
            <MessageSquare className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">Select a conversation</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Pick a thread on the left to read the history and reply to the customer.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
