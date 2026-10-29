import type { ChatConversation, ChatIdentity, ChatMessage } from '../types/chat.type'
import type { ProductChatContext } from '../../../shared/constants/chat.constants'
import { BOT_REPLIES, BOT_REPLY_DELAY_MS, GUEST_ID_KEY } from '../constants/chat.constants'
import { chatRepository } from './chat.repository'
import { websocketService } from '../../../shared/lib/websocket'
import { api, unwrapData } from '../../../shared/lib/api'

interface RemoteChatMessage {
  id: string
  sender_role: ChatMessage['sender_role']
  sender_user_id?: string
  sender_name?: string
  sender_avatar?: string
  message: string
  reply_to_id?: string | null
  reply_to?: ChatMessage['reply_to']
  is_read?: boolean
  created_at: string
}

interface RemoteChatConversation {
  id: string
  messages?: RemoteChatMessage[]
}

interface ChatApiResponse<T> {
  success: boolean
  message: string
  data?: T
  meta?: { has_more?: boolean }
}

function makeMessage(
  conversation_id: string,
  sender_role: ChatMessage['sender_role'],
  message: string,
  product_context?: ProductChatContext,
  reply_to?: { id: string; sender_role: string; message: string } | null,
  reply_to_id?: string | null,
  attachments?: ChatMessage['attachments'],
): ChatMessage {
  return {
    id: `msg-${Math.random().toString(36).slice(2, 12)}`,
    conversation_id,
    sender_role,
    message,
    product_context,
    reply_to,
    reply_to_id,
    attachments,
    created_at: new Date().toISOString(),
  }
}

function toProductAttachments(products: ProductChatContext[]): ChatMessage['attachments'] {
  if (products.length === 0) return undefined
  return products.map((p) => ({
    id: `att-${p.id}-${Math.random().toString(36).slice(2, 6)}`,
    chat_message_id: '',
    type: 'product' as const,
    value: p.id,
    metadata: p as unknown as Record<string, unknown>,
  }))
}

function pickBotReply(conversation: ChatConversation): string {
  const botCount = conversation.messages.filter((m) => m.sender_role === 'bot').length
  return BOT_REPLIES[botCount % BOT_REPLIES.length]
}

export const chatService = {
  getGuestId(): string {
    try {
      const existing = localStorage.getItem(GUEST_ID_KEY)
      if (existing) return existing
      const id = `guest-${Math.random().toString(36).slice(2, 10)}`
      localStorage.setItem(GUEST_ID_KEY, id)
      return id
    } catch {
      return `guest-${Math.random().toString(36).slice(2, 10)}`
    }
  },

  async getOrCreate(identity: ChatIdentity): Promise<ChatConversation> {
    const local = chatRepository.ensureConversation(identity)
    try {
      const synced = await this.syncConversationRemote(identity, local)
      return synced || local
    } catch {
      return local
    }
  },

  async syncConversationRemote(identity: ChatIdentity, localConv: ChatConversation): Promise<ChatConversation> {
    try {
      const res = await api.post<ChatApiResponse<RemoteChatConversation>>('/ecommerce/chats', {
        customer_user_id:
          identity.customer_user_id && !identity.customer_user_id.startsWith('guest-')
            ? identity.customer_user_id
            : null,
        customer_name: identity.customer_name || localConv.customer_name || 'Tamu',
        customer_email: identity.customer_email || localConv.customer_email || '',
        customer_phone: identity.customer_phone || localConv.customer_phone || '',
      })

      const remoteConv = unwrapData<RemoteChatConversation>(
        res.data as unknown as { success: boolean; message: string; data?: RemoteChatConversation },
      ) ?? res.data.data
      if (!remoteConv?.id) return localConv

      const oldId = localConv.id
      const remoteId = remoteConv.id

      if (oldId !== remoteId) {
        chatRepository.syncConversationId(oldId, remoteId)
      }

      // GET /chats/{id} is the canonical conversation detail endpoint.
      const detail = await this.getConversation(remoteId)
      const resolved = detail?.messages?.length ? detail : remoteConv

      // Populate remote messages into local repository
      if (Array.isArray(resolved.messages) && resolved.messages.length > 0) {
        for (const rm of resolved.messages) {
          chatRepository.insertMessage(remoteId, {
            id: rm.id,
            conversation_id: remoteId,
            sender_role: rm.sender_role,
            sender_user_id: rm.sender_user_id,
            sender_name: rm.sender_name,
            sender_avatar: rm.sender_avatar,
            message: rm.message,
            reply_to_id: rm.reply_to_id || null,
            reply_to: rm.reply_to || null,
            is_read: rm.is_read,
            created_at: rm.created_at,
          })
        }
      }

      return chatRepository.get(remoteId) || { ...localConv, id: remoteId }
    } catch (err) {
      console.warn('[ChatService] Failed to sync conversation with backend DB:', err)
      return localConv
    }
  },

  async persistMessageRemote(
    conversationId: string,
    messageText: string,
    identity: ChatIdentity,
    replyToId?: string,
    localMsgId?: string,
  ): Promise<void> {
    let targetId = conversationId
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId)) {
      try {
        const synced = await this.getOrCreate(identity)
        if (synced && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(synced.id)) {
          targetId = synced.id
        } else {
          return
        }
      } catch {
        return
      }
    }
    try {
      const res = await api.post<{ success: boolean; message: string; data?: RemoteChatMessage | { message?: RemoteChatMessage } }>(
        `/ecommerce/chats/${targetId}/messages`,
        {
          sender_role: 'customer',
          sender_user_id:
            identity.customer_user_id && !identity.customer_user_id.startsWith('guest-')
              ? identity.customer_user_id
              : null,
          message: messageText,
          reply_to_id: replyToId || undefined,
          client_temp_id: localMsgId || undefined,
        },
      )
      const body = unwrapData<RemoteChatMessage | { message?: RemoteChatMessage }>(
        res.data as unknown as { success: boolean; message: string; data?: RemoteChatMessage | { message?: RemoteChatMessage } },
      ) ?? res.data.data
      const serverMsg = (body as { message?: RemoteChatMessage } | undefined)?.message ?? body as RemoteChatMessage | undefined
      if (serverMsg?.id && localMsgId) {
        chatRepository.reconcileMessage(targetId, localMsgId, serverMsg)
      }
    } catch (err) {
      console.warn('[ChatService] Failed to persist message to PostgreSQL:', err)
    }
  },

  async sendCustomerMessage(
    identity: ChatIdentity,
    text: string,
    productContext?: ProductChatContext,
    replyTo?: ChatMessage | null,
    productContexts?: ProductChatContext[],
  ): Promise<ChatConversation> {
    const conversation = chatRepository.ensureConversation(identity)
    const replyMeta = replyTo
      ? {
          id: replyTo.id,
          sender_role: replyTo.sender_role || 'customer',
          message: replyTo.message,
        }
      : null
    const attachments = productContexts && productContexts.length > 0 ? toProductAttachments(productContexts) : undefined
    const effectiveCtx = productContext || (productContexts && productContexts.length > 0 ? productContexts[productContexts.length - 1] : undefined)

    const message = makeMessage(
      conversation.id,
      'customer',
      text,
      effectiveCtx,
      replyMeta,
      replyTo ? replyTo.id : null,
      attachments,
    )
    message.client_temp_id = message.id
    if (message.attachments) {
      for (const a of message.attachments) a.chat_message_id = message.id
    }
    const updated = chatRepository.insertMessage(conversation.id, message)

    // Note: Do NOT broadcast raw chat_message over WebSocket from client.
    // The backend REST API saves the message and broadcasts the single authoritative event.
    void this.persistMessageRemote(conversation.id, text, identity, replyTo ? replyTo.id : undefined, message.id)

    // Only invoke mock bot if WebSocket is NOT connected (offline fallback simulation)
    if (!websocketService.isConnected()) {
      const botReply = pickBotReply(updated)
      setTimeout(() => {
        const botMsg = makeMessage(updated.id, 'bot', botReply)
        chatRepository.insertMessage(updated.id, botMsg)
      }, BOT_REPLY_DELAY_MS)
    }

    return updated
  },

  async sendAgentMessage(conversation_id: string, text: string): Promise<ChatConversation> {
    const message = makeMessage(conversation_id, 'agent', text)
    const updated = chatRepository.insertMessage(conversation_id, message)

    websocketService.send({
      type: 'chat_message',
      conversation_id,
      conversation: updated,
      message,
    })

    return updated
  },

  async markRead(conversation_id: string, by: 'customer' | 'agent'): Promise<void> {
    chatRepository.markRead(conversation_id, by)
    websocketService.sendReadReceipt({
      conversation_id,
      reader_role: by === 'customer' ? 'customer' : 'admin',
      read_at: new Date().toISOString(),
    })
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(conversation_id)
    if (isUUID) {
      try {
        await api.post(`/ecommerce/chats/${conversation_id}/read`)
      } catch {
        // Local receipt is still authoritative for the widget.
      }
    }
  },

  async getConversation(conversationId: string): Promise<RemoteChatConversation | null> {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(conversationId)
    if (!isUUID) return null
    try {
      const res = await api.get<ChatApiResponse<RemoteChatConversation>>(`/ecommerce/chats/${conversationId}`)
      return unwrapData<RemoteChatConversation>(
        res.data as unknown as { success: boolean; message: string; data?: RemoteChatConversation },
      ) ?? res.data.data ?? null
    } catch {
      return null
    }
  },

  handleIncomingReadReceipt(
    conversation_id: string,
    reader_role: 'customer' | 'admin' | 'agent',
  ): ChatConversation | null {
    return chatRepository.handleIncomingReadReceipt(conversation_id, reader_role)
  },

  transferGuestHistory(identity: ChatIdentity): ChatConversation | null {
    const updated = chatRepository.transferGuestHistory(identity)
    if (updated) {
      websocketService.sendPresence({
        role: 'customer',
        conversation_id: updated.id,
        user_id: identity.customer_user_id,
        customer_user_id: identity.customer_user_id,
        customer_email: identity.customer_email,
        user_name: identity.customer_name,
        status: 'online',
        timestamp: Date.now(),
      })

      if (identity.customer_user_id && identity.customer_email) {
        void api.post('/ecommerce/chats/transfer', {
          email: identity.customer_email,
          phone: identity.customer_phone || '',
          customer_user_id: identity.customer_user_id,
          customer_name: identity.customer_name,
        }).catch((e) => console.warn('[ChatService] Backend transfer failed:', e))
      }
    }
    return updated
  },

  getLocalMessagesPage(
    conversationId: string,
    limit = 20,
    before?: string,
  ): { messages: ChatMessage[]; hasMore: boolean } {
    const conv = chatRepository.get(conversationId)
    let all = conv?.messages ? [...conv.messages] : []
    all.sort(
      (a, b) =>
        (a.created_at ? new Date(a.created_at).getTime() : 0) -
        (b.created_at ? new Date(b.created_at).getTime() : 0),
    )

    if (before) {
      const beforeMs = new Date(before).getTime()
      all = all.filter(
        (m) => (m.created_at ? new Date(m.created_at).getTime() : 0) < beforeMs,
      )
    }

    const startIndex = Math.max(0, all.length - limit)
    const paged = all.slice(startIndex)
    const hasMore = startIndex > 0

    return {
      messages: paged,
      hasMore,
    }
  },

  async fetchMessagesPage(
    conversationId: string,
    limit = 20,
    before?: string,
  ): Promise<{ messages: ChatMessage[]; hasMore: boolean }> {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(conversationId)
    if (!isUUID) {
      return this.getLocalMessagesPage(conversationId, limit, before)
    }

    try {
      const res = await api.get<ChatApiResponse<RemoteChatMessage[]>>(
        `/ecommerce/chats/${conversationId}/messages`,
        { params: { limit, ...(before ? { before } : {}) } },
      )
      const remoteMsgs = unwrapData<RemoteChatMessage[]>(
        res.data as unknown as { success: boolean; message: string; data?: RemoteChatMessage[] },
      ) ?? res.data.data
      if (!Array.isArray(remoteMsgs)) {
        return this.getLocalMessagesPage(conversationId, limit, before)
      }

      const mappedMsgs: ChatMessage[] = remoteMsgs.map((rm) => ({
        id: rm.id,
        conversation_id: conversationId,
        sender_role: rm.sender_role,
        sender_user_id: rm.sender_user_id,
        sender_name: rm.sender_name,
        sender_avatar: rm.sender_avatar,
        message: rm.message,
        reply_to_id: rm.reply_to_id || null,
        reply_to: rm.reply_to || null,
        is_read: rm.is_read,
        created_at: rm.created_at,
      }))

      for (const msg of mappedMsgs) {
        chatRepository.insertMessage(conversationId, msg)
      }

      const hasMore =
        typeof res.data.meta?.has_more === 'boolean'
          ? res.data.meta.has_more
          : mappedMsgs.length >= limit

      return {
        messages: mappedMsgs,
        hasMore,
      }
    } catch (err) {
      console.warn('[ChatService] Failed to fetch paged messages:', err)
      return this.getLocalMessagesPage(conversationId, limit, before)
    }
  },
}
