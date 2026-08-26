import { useCallback, useEffect, useState } from 'react'
import type { AsyncStatus } from '../../../shared/types/common.type'
import type { ChatConversation, ChatIdentity, ChatMessage } from '../types/chat.type'
import { chatService } from '../services/chat.service'
import { chatRepository } from '../services/chat.repository'
import { websocketService } from '../../../shared/lib/websocket'

interface UseChatResult {
  conversation: ChatConversation | null
  messages: ChatMessage[]
  status: AsyncStatus
  sending: boolean
  send: (text: string) => Promise<void>
  markRead: () => Promise<void>
}

function isChatMessagePayload(
  payload: unknown,
): payload is { type: 'chat_message'; conversation_id: string; message: ChatMessage } {
  return Boolean(
    payload &&
      typeof payload === 'object' &&
      (payload as { type?: unknown }).type === 'chat_message' &&
      typeof (payload as { conversation_id?: unknown }).conversation_id === 'string' &&
      typeof (payload as { message?: unknown }).message === 'object' &&
      (payload as { message?: unknown }).message !== null,
  )
}

export function useChat(identity: ChatIdentity): UseChatResult {
  const [conversation, setConversation] = useState<ChatConversation | null>(null)
  const [status, setStatus] = useState<AsyncStatus>('loading')
  const [sending, setSending] = useState(false)
  const { customer_user_id, customer_name, customer_email } = identity

  useEffect(() => {
    let cancelled = false
    const currentIdentity: ChatIdentity = { customer_user_id, customer_name, customer_email }

    const refresh = () => {
      chatService
        .getOrCreate(currentIdentity)
        .then((conv) => {
          if (!cancelled) setConversation(conv)
        })
        .catch(() => undefined)
    }

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

    const unsubscribe = websocketService.subscribe((payload: unknown) => {
      if (isChatMessagePayload(payload)) {
        const updated = chatRepository.insertMessage(payload.conversation_id, payload.message)
        if (updated && conversation?.id === payload.conversation_id) {
          refresh()
        }
      }
    })

    window.addEventListener('storage', refresh)
    return () => {
      cancelled = true
      window.removeEventListener('storage', refresh)
      unsubscribe()
    }
  }, [customer_user_id, customer_name, customer_email, conversation?.id])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setSending(true)
    try {
      const updated = await chatService.sendCustomerMessage(
        { customer_user_id, customer_name, customer_email },
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
