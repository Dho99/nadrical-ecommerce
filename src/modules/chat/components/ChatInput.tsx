import { type FormEvent } from 'react'
import { LoaderCircle, Send } from 'lucide-react'
import { Button, Input } from '../../../shared/components/ui'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: (text: string) => void
  sending?: boolean
  placeholder?: string
}

export function ChatInput({
  value,
  onChange,
  onSend,
  sending = false,
  placeholder = 'Type your message…',
}: ChatInputProps) {
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!value.trim() || sending) return
    onSend(value)
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2 border-t bg-background p-3">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Chat message"
        className="h-10"
      />
      <Button type="submit" size="icon" className="size-10 shrink-0" disabled={sending || !value.trim()}>
        {sending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
      </Button>
    </form>
  )
}
