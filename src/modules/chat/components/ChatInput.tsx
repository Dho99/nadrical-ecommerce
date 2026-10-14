import { type FormEvent } from 'react'
import { LoaderCircle, Reply, Send, X } from 'lucide-react'
import { Button, Input } from '../../../shared/components/ui'
import type { ChatMessage } from '../types/chat.type'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: (text: string) => void
  sending?: boolean
  placeholder?: string
  replyingTo?: ChatMessage | null
  onCancelReply?: () => void
}

export function ChatInput({
  value,
  onChange,
  onSend,
  sending = false,
  placeholder = 'Type your message…',
  replyingTo,
  onCancelReply,
}: ChatInputProps) {
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!value.trim() || sending) return
    onSend(value)
  }

  return (
    <div className="border-t bg-background">
      {replyingTo && (
        <div className="flex items-center justify-between gap-2 border-b bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 min-w-0">
            <Reply className="size-3.5 text-primary shrink-0" />
            <span className="font-medium text-foreground shrink-0">
              Membalas {replyingTo.sender_role === 'customer' ? 'Anda' : 'Admin'}:
            </span>
            <span className="truncate max-w-[200px]">{replyingTo.message}</span>
          </div>
          {onCancelReply && (
            <button
              type="button"
              onClick={onCancelReply}
              className="text-muted-foreground hover:text-foreground shrink-0"
              title="Batal balas"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      )}
      <form onSubmit={submit} className="flex items-center gap-2 p-3">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Chat message"
          maxLength={2000}
          className="h-10"
        />
        <Button type="submit" size="icon" className="size-10 shrink-0" disabled={sending || !value.trim()}>
          {sending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </form>
    </div>
  )
}

