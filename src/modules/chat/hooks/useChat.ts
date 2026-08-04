import { useCallback, useEffect, useState } from 'react'
import type { AsyncStatus } from '../../../shared/types/common.type'
import type { ChatConversation, ChatIdentity, ChatMessage } from '../types/chat.type'
import { chatService } from '../services/chat.service'

interface UseChatResult {
  conversation: ChatConversation | null
  messages: ChatMessage[]
  status: AsyncStatus
  sending: boolean
  send: (text: string) => Promise<void>
  markRead: () => Promise<void>
}

export function useChat(identity: ChatIdentity): UseChatResult {
  const [conversation, setConversation] = useState<ChatConversation | null>(null)
  const [status, setStatus] = useState<AsyncStatus>('loading')
  const [sending, setSending] = useState(false)
  const { id: identityId, name: identityName, email: identityEmail } = identity

  useEffect(() => {
    let cancelled = false
    const currentIdentity: ChatIdentity = { id: identityId, name: identityName, email: identityEmail }

    chatService
      .getOrCreate(currentIdentity)
      .then((conv) => {
        if (!cancelled) {
          setConversation(conv)
          setStatus('success')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    const onStorage = () => {
      chatService
        .getOrCreate(currentIdentity)
        .then((conv) => {
          if (!cancelled) setConversation(conv)
        })
        .catch(() => undefined)
    }
    window.addEventListener('storage', onStorage)
    return () => {
      cancelled = true
      window.removeEventListener('storage', onStorage)
    }
  }, [identityId, identityName, identityEmail])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setSending(true)
    try {
      const updated = await chatService.sendCustomerMessage(
        { id: identityId, name: identityName, email: identityEmail },
        trimmed,
      )
      setConversation(updated)
    } finally {
      setSending(false)
    }
  }

  const markRead = useCallback(async () => {
    if (!conversation) return
    await chatService.markRead(conversation.id, 'customer')
  }, [conversation])

  return {
    conversation,
    messages: conversation?.messages ?? [],
    status,
    sending,
    send,
    markRead,
  }
}
