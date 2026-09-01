import { useCallback, useEffect, useRef, useState } from 'react'
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
): payload is { type: 'chat_message'; conversation_id: string; message: ChatMessage; conversation?: Partial<ChatConversation> } {
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

  const conversationRef = useRef<ChatConversation | null>(null)
  conversationRef.current = conversation

  const loadConversation = useCallback(() => {
    return chatService
      .getOrCreate({ customer_user_id, customer_name, customer_email })
      .then((conv) => {
        setConversation(conv)
        setStatus('success')
        return conv
      })
      .catch(() => {
        setStatus('error')
        return null
      })
  }, [customer_user_id, customer_name, customer_email])

  useEffect(() => {
    void loadConversation()
  }, [loadConversation])

  useEffect(() => {
    const handleStorage = () => {
      void loadConversation()
    }

    const unsubscribe = websocketService.on('chat_message', (payload: unknown) => {
      if (isChatMessagePayload(payload)) {
        const currentConv = conversationRef.current
        // If message is for this conversation or matching customer
        if (currentConv && currentConv.id === payload.conversation_id) {
          const fallback = 'conversation' in payload ? (payload.conversation as Partial<ChatConversation>) : undefined
          chatRepository.insertMessage(payload.conversation_id, payload.message, fallback)
          void loadConversation()
        }
      }
    })

    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
      unsubscribe()
    }
  }, [loadConversation])

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
