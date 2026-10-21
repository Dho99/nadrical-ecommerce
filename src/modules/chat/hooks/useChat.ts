import { useCallback, useEffect, useRef, useState } from 'react'
import type { AsyncStatus } from '../../../shared/types/common.type'
import type {
  ChatConversation,
  ChatIdentity,
  ChatMessage,
  WSTypingPayload,
  WSPresencePayload,
  WSPresenceQueryPayload,
  WSReadReceiptPayload,
} from '../types/chat.type'
import { chatService } from '../services/chat.service'
import { chatRepository } from '../services/chat.repository'
import { websocketService } from '../../../shared/lib/websocket'

import type { ProductChatContext } from '../../../shared/constants/chat.constants'

interface UseChatResult {
  conversation: ChatConversation | null
  messages: ChatMessage[]
  status: AsyncStatus
  sending: boolean
  isAdminOnline: boolean
  isAdminTyping: boolean
  hasMore: boolean
  isLoadingMore: boolean
  loadMoreMessages: () => Promise<boolean>
  sendTyping: (isTyping: boolean) => void
  send: (
    text: string,
    productContext?: ProductChatContext,
    replyTo?: ChatMessage | null,
    productContexts?: ProductChatContext[],
  ) => Promise<void>
  markRead: () => Promise<void>
}

function isChatMessagePayload(
  payload: unknown,
): payload is {
  type: 'chat_message'
  conversation_id: string
  message: ChatMessage
  conversation?: Partial<ChatConversation>
  customer_email?: string
  customer_phone?: string
  customer_user_id?: string
} {
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
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [status, setStatus] = useState<AsyncStatus>('loading')
  const [sending, setSending] = useState(false)
  const [isAdminOnline, setIsAdminOnline] = useState(false)
  const [isAdminTyping, setIsAdminTyping] = useState(false)

  const lastAdminSeenRef = useRef<number>(0)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const adminTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTypingSentRef = useRef<number>(0)

  const isLoadingMoreRef = useRef(false)
  const hasMoreRef = useRef(true)
  const messagesRef = useRef<ChatMessage[]>([])

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    hasMoreRef.current = hasMore
  }, [hasMore])

  const { customer_user_id, customer_name, customer_email } = identity

  const conversationRef = useRef<ChatConversation | null>(null)
  useEffect(() => {
    conversationRef.current = conversation
  }, [conversation])

  const loadConversation = useCallback(async () => {
    // 1. Instant optimistic local render
    const localConv = chatRepository.ensureConversation({ customer_user_id, customer_name, customer_email })
    setConversation(localConv)
    const local = chatService.getLocalMessagesPage(localConv.id, 50)
    if (local.messages.length > 0) {
      setMessages(local.messages)
      setHasMore(local.hasMore)
      hasMoreRef.current = local.hasMore
    }

    try {
      // 2. Await remote sync with backend DB to resolve canonical UUID and messages
      const syncedConv = await chatService.getOrCreate({ customer_user_id, customer_name, customer_email })
      setConversation(syncedConv)
      setStatus('success')

      // 3. Fetch latest page 1 (50 messages) using canonical UUID
      const page = await chatService.fetchMessagesPage(syncedConv.id, 50)
      if (page.messages.length > 0 || local.messages.length === 0) {
        setMessages((prev) => {
          const map = new Map<string, ChatMessage>()
          page.messages.forEach((m) => map.set(m.id, m))
          prev.forEach((m) => {
            const alreadyInMap =
              map.has(m.id) ||
              (m.client_temp_id &&
                Array.from(map.values()).some(
                  (pm) =>
                    pm.id === m.client_temp_id ||
                    pm.client_temp_id === m.client_temp_id,
                ))
            if (!alreadyInMap) {
              map.set(m.id, m)
            }
          })
          return Array.from(map.values()).sort(
            (a, b) =>
              new Date(a.created_at || 0).getTime() -
              new Date(b.created_at || 0).getTime(),
          )
        })
        setHasMore(page.hasMore)
        hasMoreRef.current = page.hasMore
      }
      return syncedConv
    } catch {
      setStatus('error')
      return localConv
    }
  }, [customer_user_id, customer_name, customer_email])

  const loadMoreMessages = useCallback(async (): Promise<boolean> => {
    const currentConv = conversationRef.current
    if (!currentConv || isLoadingMoreRef.current || !hasMoreRef.current) return false
    const currentMessages = messagesRef.current
    if (currentMessages.length === 0) return false

    const oldest = currentMessages[0]
    const before = oldest.created_at

    isLoadingMoreRef.current = true
    setIsLoadingMore(true)
    try {
      const page = await chatService.fetchMessagesPage(currentConv.id, 20, before)
      if (page.messages.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id))
          const newOlder = page.messages.filter((m) => !existingIds.has(m.id))
          return [...newOlder, ...prev]
        })
      }
      setHasMore(page.hasMore)
      hasMoreRef.current = page.hasMore
      return page.messages.length > 0
    } catch (err) {
      console.warn('[useChat] Error fetching older messages:', err)
      return false
    } finally {
      isLoadingMoreRef.current = false
      setIsLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    void loadConversation()
  }, [loadConversation])

  useEffect(() => {
    const announcePresence = () => {
      websocketService.sendPresence({
        role: 'customer',
        conversation_id: conversationRef.current?.id,
        user_id: customer_user_id,
        customer_user_id,
        customer_email,
        user_name: customer_name,
        status: 'online',
        timestamp: Date.now(),
      })
    }

    websocketService.setPresenceAnnouncer(() => {
      announcePresence()
      websocketService.sendPresenceQuery('customer')
    })

    websocketService.connect()
    announcePresence()
    websocketService.sendPresenceQuery('customer')

    const handleStorage = () => {
      void loadConversation()
    }

    const matchesMyConversation = (
      targetConvId?: string | null,
      targetEmail?: string | null,
      targetUserId?: string | null,
      targetPhone?: string | null,
    ) => {
      const currentConv = conversationRef.current
      if (!currentConv) return false
      if (targetConvId && targetConvId === currentConv.id) return true

      const effectiveEmail = currentConv.customer_email || customer_email
      if (
        targetEmail &&
        effectiveEmail &&
        targetEmail.trim().toLowerCase() === effectiveEmail.trim().toLowerCase()
      ) {
        return true
      }

      const effectivePhone = currentConv.customer_phone || identity.customer_phone
      if (
        targetPhone &&
        effectivePhone &&
        targetPhone.trim() === effectivePhone.trim()
      ) {
        return true
      }

      const effectiveUserId = currentConv.customer_user_id || customer_user_id
      if (
        targetUserId &&
        effectiveUserId &&
        !targetUserId.startsWith('guest-') &&
        targetUserId === effectiveUserId
      ) {
        return true
      }
      return false
    }

    const unsubChat = websocketService.on('chat_message', (payload: unknown) => {
      if (isChatMessagePayload(payload)) {
        const incomingConv =
          'conversation' in payload
            ? (payload.conversation as Partial<ChatConversation>)
            : undefined
        const incomingEmail =
          incomingConv?.customer_email ||
          ('customer_email' in payload ? (payload.customer_email as string) : undefined)
        const incomingUserId =
          incomingConv?.customer_user_id ||
          ('customer_user_id' in payload ? (payload.customer_user_id as string) : undefined)
        const incomingPhone =
          incomingConv?.customer_phone ||
          ('customer_phone' in payload ? (payload.customer_phone as string) : undefined)

        if (
          matchesMyConversation(
            payload.conversation_id,
            incomingEmail,
            incomingUserId,
            incomingPhone,
          )
        ) {
          const currentConv = conversationRef.current
          // ALWAYS insert message using the active local conversation ID
          // so it immediately updates the customer's open chat UI!
          const activeConvId = currentConv?.id || payload.conversation_id
          const normalizedMsg: ChatMessage = {
            ...payload.message,
            conversation_id: activeConvId,
          }

          chatRepository.insertMessage(activeConvId, normalizedMsg, incomingConv)

          // If server/admin provided a canonical ID different from local ID, sync the conversation ID
          if (currentConv && payload.conversation_id && payload.conversation_id !== currentConv.id) {
            chatRepository.syncConversationId(currentConv.id, payload.conversation_id)
            setConversation((prev) => (prev ? { ...prev, id: payload.conversation_id } : prev))
          }

          setMessages((prev) => {
            const idx = prev.findIndex(
              (m) =>
                m.id === normalizedMsg.id ||
                (normalizedMsg.client_temp_id && (m.id === normalizedMsg.client_temp_id || m.client_temp_id === normalizedMsg.client_temp_id)) ||
                (m.client_temp_id && m.client_temp_id === normalizedMsg.id) ||
                (m.sender_role === normalizedMsg.sender_role &&
                  m.message === normalizedMsg.message &&
                  Math.abs(new Date(m.created_at || 0).getTime() - new Date(normalizedMsg.created_at || 0).getTime()) < 30000),
            )
            if (idx !== -1) {
              const updated = [...prev]
              updated[idx] = {
                ...updated[idx],
                ...normalizedMsg,
                id: normalizedMsg.id,
                created_at: normalizedMsg.created_at || updated[idx].created_at,
              }
              return updated
            }
            return [...prev, normalizedMsg]
          })

          if (
            payload.message.sender_role === 'admin' ||
            payload.message.sender_role === 'agent' ||
            payload.message.sender_role === 'bot'
          ) {
            setIsAdminTyping(false)
            lastAdminSeenRef.current = Date.now()
            setIsAdminOnline(true)
          }
        }
      }
    })

    const unsubTyping = websocketService.onTyping((payload: WSTypingPayload) => {
      if (!payload) return
      if (payload.sender_role === 'admin' || payload.sender_role === 'agent') {
        if (!matchesMyConversation(payload.conversation_id, payload.customer_email, payload.customer_user_id)) {
          return
        }

        setIsAdminTyping(payload.is_typing)
        lastAdminSeenRef.current = Date.now()
        setIsAdminOnline(true)

        if (adminTypingTimeoutRef.current) {
          clearTimeout(adminTypingTimeoutRef.current)
        }
        if (payload.is_typing) {
          adminTypingTimeoutRef.current = setTimeout(() => {
            setIsAdminTyping(false)
          }, 3500)
        }
      }
    })

    const unsubPresence = websocketService.onPresence((payload: WSPresencePayload) => {
      if (!payload) return
      if (payload.role === 'admin' || payload.role === 'agent') {
        lastAdminSeenRef.current = Date.now()
        setIsAdminOnline(payload.status === 'online')
      }
    })

    const unsubPresenceQuery = websocketService.onPresenceQuery((payload: WSPresenceQueryPayload) => {
      if (payload && (payload.sender_role === 'admin' || payload.sender_role === 'agent')) {
        announcePresence()
      }
    })

    const unsubReadReceipt = websocketService.onReadReceipt((payload: WSReadReceiptPayload) => {
      if (!payload || (payload.reader_role !== 'admin' && payload.reader_role !== 'agent')) return
      if (!matchesMyConversation(payload.conversation_id, payload.customer_email, payload.customer_user_id)) return
      const currentConv = conversationRef.current
      const activeConvId = currentConv?.id || payload.conversation_id
      chatService.handleIncomingReadReceipt(activeConvId, payload.reader_role)
      void loadConversation()
    })

    const heartbeatTimer = setInterval(() => {
      announcePresence()
    }, 20000)

    const sweepTimer = setInterval(() => {
      if (lastAdminSeenRef.current > 0 && Date.now() - lastAdminSeenRef.current > 35000) {
        setIsAdminOnline(false)
      }
    }, 5000)

    const handleBeforeUnload = () => {
      websocketService.sendPresence({
        role: 'customer',
        conversation_id: conversationRef.current?.id,
        user_id: customer_user_id,
        customer_user_id,
        customer_email,
        user_name: customer_name,
        status: 'offline',
        timestamp: Date.now(),
      })
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      unsubChat()
      unsubTyping()
      unsubPresence()
      unsubPresenceQuery()
      unsubReadReceipt()
      clearInterval(heartbeatTimer)
      clearInterval(sweepTimer)
    }
  }, [loadConversation, customer_user_id, customer_email, customer_name])

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      const convId = conversationRef.current?.id
      if (!convId) return
      const now = Date.now()

      if (isTyping) {
        if (now - lastTypingSentRef.current > 1800) {
          lastTypingSentRef.current = now
          websocketService.sendTyping({
            conversation_id: convId,
            sender_role: 'customer',
            sender_name: customer_name,
            customer_email,
            customer_user_id,
            is_typing: true,
          })
        }

        if (typingTimerRef.current) {
          clearTimeout(typingTimerRef.current)
        }
        typingTimerRef.current = setTimeout(() => {
          websocketService.sendTyping({
            conversation_id: convId,
            sender_role: 'customer',
            sender_name: customer_name,
            customer_email,
            customer_user_id,
            is_typing: false,
          })
          lastTypingSentRef.current = 0
        }, 2500)
      } else {
        lastTypingSentRef.current = 0
        if (typingTimerRef.current) {
          clearTimeout(typingTimerRef.current)
        }
        websocketService.sendTyping({
          conversation_id: convId,
          sender_role: 'customer',
          sender_name: customer_name,
          customer_email,
          customer_user_id,
          is_typing: false,
        })
      }
    },
    [customer_name, customer_email, customer_user_id],
  )

  const send = async (
    text: string,
    productContext?: ProductChatContext,
    replyTo?: ChatMessage | null,
    productContexts?: ProductChatContext[],
  ) => {
    const trimmed = text.trim()
    if (!trimmed || sending) return

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current)
    }
    const convId = conversationRef.current?.id
    if (convId) {
      websocketService.sendTyping({
        conversation_id: convId,
        sender_role: 'customer',
        sender_name: customer_name,
        is_typing: false,
      })
    }

    setSending(true)
    try {
      const updated = await chatService.sendCustomerMessage(
        { customer_user_id, customer_name, customer_email },
        trimmed,
        productContext,
        replyTo,
        productContexts,
      )
      setConversation(updated)
      if (updated.messages.length > 0) {
        const lastMsg = updated.messages[updated.messages.length - 1]
        setMessages((prev) => {
          const idx = prev.findIndex(
            (m) =>
              m.id === lastMsg.id ||
              (lastMsg.client_temp_id && (m.id === lastMsg.client_temp_id || m.client_temp_id === lastMsg.client_temp_id)) ||
              (m.sender_role === lastMsg.sender_role &&
                m.message === lastMsg.message &&
                Math.abs(new Date(m.created_at || 0).getTime() - new Date(lastMsg.created_at || 0).getTime()) < 30000),
          )
          if (idx !== -1) {
            const up = [...prev]
            up[idx] = { ...up[idx], ...lastMsg }
            return up
          }
          return [...prev, lastMsg]
        })
      }
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
  }
}
